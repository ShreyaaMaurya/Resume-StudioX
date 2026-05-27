const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_VERSION = process.env.GEMINI_API_VERSION?.trim() || "v1beta";
const GEMINI_MODEL_DEFAULT = "gemini-2.5-flash";
const GEMINI_MODEL_FALLBACKS = [
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-flash-latest",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.0-pro"
];
const OPENAI_MODEL = "gpt-4o-mini";

function normalizeApiKey(rawVal) {
    if (!rawVal || typeof rawVal !== "string") {
        return null;
    }

    const trimmed = rawVal.trim();
    if (!trimmed) {
        return null;
    }

    if (
        trimmed === "null" ||
        trimmed === "undefined" ||
        trimmed === "your_gemini_api_key_here" ||
        trimmed === "your_openai_api_key_here" ||
        trimmed.includes("placeholder") ||
        trimmed.length <= 15
    ) {
        return null;
    }

    return trimmed;
}

function getApiKeyCandidates(headerVal, envVal) {
    const candidates = [];
    const seen = new Set();

    const addCandidate = (rawVal, source) => {
        const apiKey = normalizeApiKey(rawVal);
        if (!apiKey || seen.has(apiKey)) {
            return;
        }
        seen.add(apiKey);
        candidates.push({ apiKey, source });
    };

    addCandidate(headerVal, "request");
    addCandidate(envVal, "env");
    return candidates;
}

function getProviderCandidates(req) {
    const geminiCandidates = getApiKeyCandidates(
        req.headers["x-gemini-key"],
        process.env.GEMINI_API_KEY
    ).map(({ apiKey, source }) => ({
        provider: "gemini",
        apiKey,
        source
    }));

    const openaiCandidates = getApiKeyCandidates(
        req.headers["x-openai-key"],
        process.env.OPENAI_API_KEY
    ).map(({ apiKey, source }) => ({
        provider: "openai",
        apiKey,
        source
    }));

    return [...geminiCandidates, ...openaiCandidates];
}

function formatProviderSource(source) {
    return source === "request" ? "browser-stored key" : ".env key";
}

function isQuotaExceededError(err) {
    const errorText = [
        err?.message || "",
        err?.cause?.message || "",
        err?.stack || ""
    ]
        .join(" ")
        .toLowerCase();

    return (
        errorText.includes("429") ||
        errorText.includes("too many requests") ||
        errorText.includes("quota") ||
        errorText.includes("resource_exhausted")
    );
}

function buildProviderFailureReason(lastAttempt, err) {
    if (!lastAttempt) {
        return "Configured AI provider failed and the app used offline fallback data.";
    }

    const providerName = lastAttempt.provider === "gemini" ? "Gemini" : "OpenAI";
    const sourceLabel = formatProviderSource(lastAttempt.source);
    const errorParts = [];
    if (err?.message) {
        errorParts.push(err.message.replace(/\s+/g, " ").trim());
    }
    if (err?.cause?.message) {
        errorParts.push(`cause: ${err.cause.message.replace(/\s+/g, " ").trim()}`);
    }
    if (err?.code) {
        errorParts.push(`code: ${err.code}`);
    }
    const compactError = errorParts.join(" | ");

    if (!compactError) {
        return `${providerName} ${sourceLabel} request failed, so offline fallback data was used.`;
    }

    const shortError =
        compactError.length > 220 ? `${compactError.slice(0, 217)}...` : compactError;
    return `${providerName} ${sourceLabel} request failed: ${shortError}`;
}

function applyProviderSuccessMetadata(req, providerCandidate) {
    req.aiUsedRealProvider = true;
    req.aiHasConfiguredProvider = true;
    req.aiProviderUsed = providerCandidate.provider;
    req.aiProviderKeySource = providerCandidate.source;
    req.aiProviderFailureCode = null;
    req.aiProviderFailureReason = null;
}

function applyProviderFallbackMetadata(req, providerCandidates, lastAttempt, lastError) {
    req.aiUsedRealProvider = false;
    req.aiHasConfiguredProvider = providerCandidates.length > 0;
    req.aiProviderUsed = null;
    req.aiProviderKeySource = null;

    if (!providerCandidates.length) {
        req.aiProviderFailureCode = "no_api_key_configured";
        req.aiProviderFailureReason =
            "No Gemini or OpenAI API key is configured on this request or server.";
        return;
    }

    req.aiProviderFailureCode = isQuotaExceededError(lastError)
        ? "provider_quota_exceeded"
        : "provider_request_failed";
    req.aiProviderFailureReason = buildProviderFailureReason(lastAttempt, lastError);
}

async function runWithProviderCandidates(providerCandidates, runner, contextLabel) {
    let lastError = null;
    let lastAttempt = null;

    for (const providerCandidate of providerCandidates) {
        lastAttempt = providerCandidate;
        try {
            const result = await runner(providerCandidate);
            return { result, providerCandidate };
        } catch (err) {
            lastError = err;
            console.warn(
                `[AI Core] ${contextLabel} failed via ${providerCandidate.provider} (${formatProviderSource(providerCandidate.source)}): ${err.message}`
            );
        }
    }

    return { error: lastError, lastAttempt };
}

async function extractPdfTextFromBase64(base64Data) {
    try {
        const pdfParse = require("pdf-parse");
        const buffer = Buffer.from(base64Data, "base64");
        const data = await pdfParse(buffer);
        return (data.text || "").trim();
    } catch (err) {
        console.error("[AI Core] PDF text extraction failed:", err.message);
        throw new Error(`PDF_TEXT_EXTRACTION_FAILED: ${err.message}`);
    }
}

// Local Dynamic Semantic Database for instant, beautiful offline fallbacks
const LOCAL_SEMANTIC_DB = {
    developer: {
        summary: "Innovative Full Stack Developer with 5+ years of experience engineering secure, scalable web systems and modern microservices. Expert in building low-latency API networks, optimizing relational/NoSQL schemas, and crafting pixel-perfect responsive layouts with sleek transitions.",
        company: "Vortex Tech Solutions",
        role: "Lead Systems Developer",
        bullets: "Architected high-volume server infrastructures using Node.js and Express, reducing server paint latencies by 32%.\nSpearheaded migration of legacy relational schemas into MongoDB, maximizing read/write transaction speeds.\nCollaborated closely with design architects to build responsive frontend interfaces using Tailwind CSS and native responsive grids.",
        skills: "React, Node.js, Express, MongoDB, TypeScript, Tailwind CSS, REST APIs, Git, Docker, AWS",
        certifications: "AWS Certified Developer – Associate",
        provider: "Amazon Web Services"
    },
    designer: {
        summary: "Creative UI/UX Designer dedicated to sculpting premium, user-centered digital interfaces and fluid visual ecosystems. Highly skilled in interactive prototyping, design systems engineering, spatial planning, and high-fidelity product layouts.",
        company: "Prism Creative Studios",
        role: "Senior Visual Designer",
        bullets: "Designed and launched complete design system tokens adopted by across 4 core business web layouts.\nConducted high-frequency user-feedback matrices, increasing target page conversion scores by 26%.\nCrafted high-fidelity dynamic prototyping layers in Figma, optimizing developer handoff time frames.",
        skills: "Figma, Adobe XD, Design Systems, Glassmorphism, Wireframing, CSS Grid, Prototyping, Responsive Layouts",
        certifications: "Google UX Design Professional Certificate",
        provider: "Google"
    },
    data: {
        summary: "Analytical Data Scientist specializing in deploying statistical models, advanced database optimizations, and complex data pipeline engineering. Skilled at translating dense telemetry feeds into predictive visual charts.",
        company: "Synthetix Analytics",
        role: "Data Science Lead",
        bullets: "Created predictive machine learning regressions, boosting quarterly forecast accuracy scores by 18%.\nManaged relational ETL pipelines, standardizing structural databases with up to 15M unique transactions.\nProgrammed elegant dashboard visual interfaces inside React framework for rapid executive analysis.",
        skills: "Python, SQL, R, Pandas, TensorFlow, PostgreSQL, Tableau, Machine Learning, ETL Pipelines, AWS",
        certifications: "Professional Data Engineer Certification",
        provider: "Google Cloud"
    },
    finance: {
        summary: "Detail-oriented Financial Analyst with a strong background in mathematical budgeting, dynamic risk assessment modeling, and corporate investment tracking. Adept at identifying process cost leaks and optimizing returns.",
        company: "Walton & Co. Investments",
        role: "Senior Asset Analyst",
        bullets: "Managed diverse corporate portfolios valued at $12M, achieving annual yield improvements of 8%.\nRefined internal risk metrics, decreasing overhead operational costs through precise data reviews.\nAutomated asset tracking templates in analytical databases, saving 12+ weekly resource hours.",
        skills: "Financial Modeling, Portfolio Analysis, Risk Management, Excel VBA, SQL, Forecasting, Budgeting",
        certifications: "Chartered Financial Analyst (CFA) Level II",
        provider: "CFA Institute"
    },
    marketing: {
        summary: "Dynamic Marketing Specialist experienced in launching high-performing programmatic campaigns, SEO architectures, and automated funnel systems. Expert at increasing traffic acquisitions and lead generation scores.",
        company: "OmniChannel Group",
        role: "Senior Growth Strategist",
        bullets: "Designed search performance strategies, boosting organic inbound lead rates by 44%.\nAdministered automated visual customer retention paths, maximizing user lifecycle transactional values.\nManaged complete advertising campaigns, achieving 3.2x return on ad spend (ROAS) standards.",
        skills: "SEO, SEM, Google Analytics, Copywriting, A/B Testing, Email Marketing, CSS, Content Strategy, Hubspot",
        certifications: "Inbound Marketing Certification",
        provider: "HubSpot Academy"
    },
    manager: {
        summary: "Strategic Project Manager adept at executing complex, multi-phase technical roadmaps using Agile methodologies. Proven leader in resolving dependency blockers, aligning stakeholders, and delivering products on budget.",
        company: "Apex Enterprise Systems",
        role: "Technical Program Manager",
        bullets: "Coordinated cross-functional teams to deliver 6 major cloud releases on strict timelines.\nImplemented advanced agile process frameworks, reducing delivery sprint slippages by 20%.\nManaged strategic budgeting sheets, optimizing resource allocations across engineering divisions.",
        skills: "Project Management, Agile Sprints, Scrum, Jira, Budgeting, Stakeholder Relations, Risk Mitigation",
        certifications: "Project Management Professional (PMP)",
        provider: "Project Management Institute (PMI)"
    }
};

// Local ATS Database Fallback
const LOCAL_ATS_DB = {
    developer: [
        { term: "React.js", score: 98, context: "Highlight under frontend layout frameworks" },
        { term: "REST APIs", score: 95, context: "Incorporate into backend system bullets" },
        { term: "MongoDB / SQL", score: 92, context: "Specify database engine experience" },
        { term: "TypeScript", score: 88, context: "List in core styling and programming skills" },
        { term: "AWS (S3/EC2)", score: 85, context: "Add to systems deployment summaries" },
        { term: "Microservices", score: 82, context: "Detail within enterprise experience notes" },
        { term: "CI/CD Pipelines", score: 80, context: "Specify version control workflows" }
    ],
    designer: [
        { term: "Design Systems", score: 99, context: "Detail inside visual architecture blocks" },
        { term: "Figma Prototyping", score: 96, context: "Specify workspace layout utilities" },
        { term: "UI/UX Architecture", score: 94, context: "Add to summary branding statements" },
        { term: "Information Hierarchy", score: 90, context: "Integrate into grid layout outlines" },
        { term: "Wireframing", score: 87, context: "List inside project process details" },
        { term: "Usability Testing", score: 83, context: "Mention in product feedback bullet points" }
    ],
    data: [
        { term: "Python / Pandas", score: 99, context: "Highlight in programming and analysis section" },
        { term: "Machine Learning", score: 95, context: "Specify predictive models in project bullets" },
        { term: "SQL Queries", score: 93, context: "Add to database optimization notes" },
        { term: "Data Pipelines (ETL)", score: 89, context: "Integrate in data infrastructure summary" },
        { term: "Tableau Visualization", score: 86, context: "Mention in metrics dashboard sections" },
        { term: "Statistical Analysis", score: 82, context: "List in technical background fields" }
    ],
    finance: [
        { term: "Financial Modeling", score: 98, context: "Add to target risk modeling points" },
        { term: "Portfolio Management", score: 95, context: "Highlight within asset tracking summary" },
        { term: "Risk Mitigation", score: 91, context: "Specify inside company audit bullets" },
        { term: "Excel (VBA)", score: 88, context: "Incorporate into automation techniques" },
        { term: "Data Analytics", score: 84, context: "List inside analytical skillsets" }
    ],
    marketing: [
        { term: "SEO & SEM", score: 98, context: "Highlight in digital campaign outlines" },
        { term: "Google Analytics", score: 95, context: "Specify visual traffic analytics" },
        { term: "Conversion Rate Optimization (CRO)", score: 92, context: "Integrate into user funnel bullets" },
        { term: "A/B Testing", score: 89, context: "Incorporate into growth engineering lists" },
        { term: "Content Strategy", score: 85, context: "Add to branding summaries" }
    ],
    manager: [
        { term: "Agile / Scrum", score: 99, context: "Highlight in workflow management" },
        { term: "Technical Program Management", score: 96, context: "Incorporate in role description headings" },
        { term: "Stakeholder Alignment", score: 92, context: "Integrate into executive summaries" },
        { term: "Jira / Confluence", score: 89, context: "List under tracking technologies" },
        { term: "Resource Allocation", score: 84, context: "Add to strategic operations bullets" }
    ]
};

// Helper: Determine best local matching template
function getLocalMatch(targetRole) {
    const roleLower = (targetRole || "").toLowerCase();
    
    if (roleLower.includes("dev") || roleLower.includes("engine") || roleLower.includes("coder") || roleLower.includes("program")) {
        return { category: "developer", data: LOCAL_SEMANTIC_DB.developer, keywords: LOCAL_ATS_DB.developer };
    }
    if (roleLower.includes("design") || roleLower.includes("ux") || roleLower.includes("ui") || roleLower.includes("art")) {
        return { category: "designer", data: LOCAL_SEMANTIC_DB.designer, keywords: LOCAL_ATS_DB.designer };
    }
    if (roleLower.includes("data") || roleLower.includes("science") || roleLower.includes("statist") || roleLower.includes("analyt")) {
        return { category: "data", data: LOCAL_SEMANTIC_DB.data, keywords: LOCAL_ATS_DB.data };
    }
    if (roleLower.includes("finance") || roleLower.includes("invest") || roleLower.includes("bank") || roleLower.includes("account")) {
        return { category: "finance", data: LOCAL_SEMANTIC_DB.finance, keywords: LOCAL_ATS_DB.finance };
    }
    if (roleLower.includes("market") || roleLower.includes("seo") || roleLower.includes("growth") || roleLower.includes("brand")) {
        return { category: "marketing", data: LOCAL_SEMANTIC_DB.marketing, keywords: LOCAL_ATS_DB.marketing };
    }
    if (roleLower.includes("manag") || roleLower.includes("lead") || roleLower.includes("product") || roleLower.includes("scrum")) {
        return { category: "manager", data: LOCAL_SEMANTIC_DB.manager, keywords: LOCAL_ATS_DB.manager };
    }

    // Default general template customized with role
    const genericData = {
        summary: `Strategic and results-driven Professional specializing in ${targetRole} methodologies. Adept at coordinating complex workflow pipelines, driving productivity outputs, and standardizing system benchmarks to exceed corporate metrics.`,
        company: "Nexus Enterprises",
        role: `Lead ${targetRole}`,
        bullets: `Spearheaded daily operational checklists for target ${targetRole} processes.\nCollaborated on structural project plans, increasing milestone delivery metrics by 15%.\nLeveraged modern digital platforms to optimize team tracking and performance analytics.`,
        skills: `${targetRole}, Strategy, Process Optimization, System Standards, Stakeholder Relations, Performance Tracking`,
        certifications: `${targetRole} Specialist Certification`,
        provider: "Professional Academy"
    };

    const genericATS = [
        { term: targetRole, score: 99, context: "Place directly in your summary title" },
        { term: "Process Optimization", score: 94, context: "List within experience descriptions" },
        { term: "Project Lifecycle", score: 89, context: "Highlight inside management matrices" },
        { term: "Collaborative Design", score: 85, context: "Add to teamwork benchmarks" }
    ];

    return { category: "generic", data: genericData, keywords: genericATS };
}

const RESUME_BLOCK_TYPES = new Set([
    "summary",
    "experience",
    "project",
    "skills",
    "education",
    "language",
    "certification",
    "award"
]);

function normalizeString(value) {
    return typeof value === "string" ? value.trim() : "";
}

function normalizeBulletItems(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => normalizeString(item))
            .filter(Boolean);
    }

    if (typeof value === "string") {
        return value
            .split(/\r?\n+/)
            .map((item) => item.replace(/^[•*-]\s*/, "").trim())
            .filter(Boolean);
    }

    return [];
}

function normalizeResumeBlocks(blocks) {
    if (!Array.isArray(blocks)) {
        return [];
    }

    return blocks
        .map((block) => {
            const type = normalizeString(block?.type || block?.blockType).toLowerCase();
            if (!RESUME_BLOCK_TYPES.has(type)) {
                return null;
            }

            return {
                type,
                val1: normalizeString(block?.val1),
                val2: normalizeString(block?.val2),
                bullets: normalizeBulletItems(block?.bullets)
            };
        })
        .filter(Boolean);
}

function buildBlocksFromLegacyResumePayload(rawPayload) {
    const blocks = [];

    if (normalizeString(rawPayload?.summary)) {
        blocks.push({
            type: "summary",
            val1: normalizeString(rawPayload.summary),
            val2: "",
            bullets: []
        });
    }

    const experienceList = Array.isArray(rawPayload?.experiences)
        ? rawPayload.experiences
        : rawPayload?.experience
            ? [rawPayload.experience]
            : [];
    experienceList.forEach((item) => {
        const company = normalizeString(item?.company);
        const role = normalizeString(item?.role);
        const bullets = normalizeBulletItems(item?.bullets);
        if (company || role || bullets.length) {
            blocks.push({
                type: "experience",
                val1: company,
                val2: role,
                bullets
            });
        }
    });

    const projectList = Array.isArray(rawPayload?.projects) ? rawPayload.projects : [];
    projectList.forEach((item) => {
        const title = normalizeString(item?.name || item?.title || item?.val1);
        const bullets = normalizeBulletItems(item?.bullets || item?.description);
        if (title || bullets.length) {
            blocks.push({
                type: "project",
                val1: title,
                val2: "",
                bullets
            });
        }
    });

    const skillsLine = Array.isArray(rawPayload?.skillItems)
        ? rawPayload.skillItems.map((item) => normalizeString(item)).filter(Boolean).join(", ")
        : normalizeString(rawPayload?.skills);
    if (skillsLine) {
        blocks.push({
            type: "skills",
            val1: skillsLine,
            val2: "",
            bullets: []
        });
    }

    const educationList = Array.isArray(rawPayload?.educations)
        ? rawPayload.educations
        : rawPayload?.education
            ? [rawPayload.education]
            : [];
    educationList.forEach((item) => {
        const institution = normalizeString(item?.institution);
        const degree = normalizeString(item?.degree);
        if (institution || degree) {
            blocks.push({
                type: "education",
                val1: institution,
                val2: degree,
                bullets: []
            });
        }
    });

    const languagesLine = Array.isArray(rawPayload?.languageItems)
        ? rawPayload.languageItems.map((item) => normalizeString(item)).filter(Boolean).join(", ")
        : normalizeString(rawPayload?.languages);
    if (languagesLine) {
        blocks.push({
            type: "language",
            val1: languagesLine,
            val2: "",
            bullets: []
        });
    }

    const certificationList = Array.isArray(rawPayload?.certificationEntries)
        ? rawPayload.certificationEntries
        : rawPayload?.certifications
            ? [rawPayload.certifications]
            : [];
    certificationList.forEach((item) => {
        const title = normalizeString(item?.title);
        const provider = normalizeString(item?.provider);
        if (title || provider) {
            blocks.push({
                type: "certification",
                val1: title,
                val2: provider,
                bullets: []
            });
        }
    });

    const awardItems = Array.isArray(rawPayload?.awardItems)
        ? rawPayload.awardItems
        : Array.isArray(rawPayload?.awards)
            ? rawPayload.awards
            : normalizeString(rawPayload?.awards)
                ? [rawPayload.awards]
                : [];
    const normalizedAwards = awardItems
        .map((item) => normalizeString(item))
        .filter(Boolean);
    if (normalizedAwards.length) {
        blocks.push({
            type: "award",
            val1: "",
            val2: "",
            bullets: normalizedAwards
        });
    }

    return blocks;
}

function extractPrimaryBlock(blocks, type) {
    return blocks.find((block) => block.type === type) || null;
}

function normalizeAIResumePayload(rawPayload, fallbackTargetRole = "") {
    const basics = {
        fullName: normalizeString(rawPayload?.basics?.fullName || rawPayload?.fullName),
        targetRole: normalizeString(rawPayload?.basics?.targetRole || rawPayload?.targetRole || fallbackTargetRole),
        email: normalizeString(rawPayload?.basics?.email || rawPayload?.email),
        phone: normalizeString(rawPayload?.basics?.phone || rawPayload?.phone),
        location: normalizeString(rawPayload?.basics?.location || rawPayload?.location),
        website: normalizeString(rawPayload?.basics?.website || rawPayload?.website)
    };

    const normalizedBlocks = normalizeResumeBlocks(rawPayload?.blocks);
    const blocks = normalizedBlocks.length
        ? normalizedBlocks
        : buildBlocksFromLegacyResumePayload(rawPayload || {});

    const summaryBlock = extractPrimaryBlock(blocks, "summary");
    const experienceBlock = extractPrimaryBlock(blocks, "experience");
    const educationBlock = extractPrimaryBlock(blocks, "education");
    const certificationBlock = extractPrimaryBlock(blocks, "certification");
    const skillsBlock = extractPrimaryBlock(blocks, "skills");
    const languageBlock = extractPrimaryBlock(blocks, "language");
    const awardBlock = extractPrimaryBlock(blocks, "award");

    return {
        basics,
        blocks,
        summary: summaryBlock?.val1 || "",
        experience: experienceBlock
            ? {
                company: experienceBlock.val1,
                role: experienceBlock.val2,
                bullets: experienceBlock.bullets.join("\n")
            }
            : null,
        skills: skillsBlock?.val1 || "",
        education: educationBlock
            ? {
                institution: educationBlock.val1,
                degree: educationBlock.val2
            }
            : null,
        certifications: certificationBlock
            ? {
                title: certificationBlock.val1,
                provider: certificationBlock.val2
            }
            : null,
        languages: languageBlock?.val1 || "",
        awards: awardBlock?.bullets || []
    };
}

function buildResumeDataContext(resumeData) {
    if (!resumeData || typeof resumeData !== "object") {
        return "";
    }

    const lines = [];
    const fullName = normalizeString(resumeData.fullName);
    const targetRole = normalizeString(resumeData.targetRole);
    const email = normalizeString(resumeData.email);
    const phone = normalizeString(resumeData.phone);
    const location = normalizeString(resumeData.location);
    const website = normalizeString(resumeData.website);
    const summary = normalizeString(resumeData.summary);
    const blocks = Array.isArray(resumeData.blocks) ? resumeData.blocks : [];

    if (fullName) lines.push(`Full Name: ${fullName}`);
    if (targetRole) lines.push(`Current Target Role: ${targetRole}`);
    if (email) lines.push(`Email: ${email}`);
    if (phone) lines.push(`Phone: ${phone}`);
    if (location) lines.push(`Location: ${location}`);
    if (website) lines.push(`Website: ${website}`);
    if (summary) lines.push(`Summary: ${summary}`);

    blocks.forEach((block, index) => {
        const type = normalizeString(block?.blockType || block?.type || "section");
        const val1 = normalizeString(block?.val1);
        const val2 = normalizeString(block?.val2);
        const bullets = normalizeBulletItems(block?.bullets);

        lines.push(`Section ${index + 1} Type: ${type}`);
        if (val1) lines.push(`Section ${index + 1} Value 1: ${val1}`);
        if (val2) lines.push(`Section ${index + 1} Value 2: ${val2}`);
        if (bullets.length) {
            lines.push(`Section ${index + 1} Bullets: ${bullets.join(" | ")}`);
        }
    });

    return lines.join("\n");
}

function detectResumeSectionKey(line) {
    const normalizedLine = normalizeString(line)
        .toLowerCase()
        .replace(/[^a-z\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    if (!normalizedLine) {
        return null;
    }

    const sectionMatchers = [
        { key: "summary", patterns: ["summary", "professional summary", "profile", "objective", "about me"] },
        { key: "experience", patterns: ["experience", "work experience", "professional experience", "employment history", "career history"] },
        { key: "project", patterns: ["projects", "project experience", "key projects"] },
        { key: "skills", patterns: ["skills", "technical skills", "core skills", "competencies"] },
        { key: "education", patterns: ["education", "academic background", "academics"] },
        { key: "language", patterns: ["languages", "language"] },
        { key: "certification", patterns: ["certifications", "certification", "licenses", "certificates"] },
        { key: "award", patterns: ["awards", "honors", "achievements", "awards and honors"] }
    ];

    for (const matcher of sectionMatchers) {
        if (matcher.patterns.includes(normalizedLine)) {
            return matcher.key;
        }
    }

    return null;
}

function splitSectionGroups(lines) {
    const groups = [];
    let currentGroup = [];

    lines.forEach((rawLine) => {
        const line = normalizeString(rawLine);
        if (!line) {
            if (currentGroup.length) {
                groups.push(currentGroup);
                currentGroup = [];
            }
            return;
        }
        currentGroup.push(line);
    });

    if (currentGroup.length) {
        groups.push(currentGroup);
    }

    return groups;
}

function stripLikelyDateRange(text) {
    return normalizeString(text)
        .replace(/\b(?:19|20)\d{2}\b/g, "")
        .replace(/\b(?:present|current)\b/gi, "")
        .replace(/\s{2,}/g, " ")
        .replace(/[|–—-]\s*$/g, "")
        .trim();
}

function parseRoleCompanyLine(line) {
    const cleaned = stripLikelyDateRange(line);
    if (!cleaned) {
        return { role: "", company: "" };
    }

    if (cleaned.toLowerCase().includes(" at ")) {
        const [role, company] = cleaned.split(/\s+at\s+/i);
        return { role: normalizeString(role), company: normalizeString(company) };
    }

    if (cleaned.includes("|")) {
        const [role, company] = cleaned.split("|");
        return { role: normalizeString(role), company: normalizeString(company) };
    }

    if (cleaned.includes(",")) {
        const [role, company] = cleaned.split(",");
        return { role: normalizeString(role), company: normalizeString(company) };
    }

    return { role: cleaned, company: "" };
}

function tokenizeCommaSeparatedLine(text) {
    return normalizeString(text)
        .split(/[,|/]+/)
        .map((item) => normalizeString(item))
        .filter(Boolean);
}

function extractBasicsFromResumeText(resumeText, fallbackTargetRole) {
    const lines = resumeText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    const joinedText = lines.join("\n");
    const emailMatch = joinedText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const phoneMatch = joinedText.match(/(?:\+?\d[\d\s().-]{7,}\d)/);
    const websiteMatch = joinedText.match(/(?:https?:\/\/\S+|www\.\S+|\b\S+\.(?:com|dev|in|org|net)\b)/i);

    let fullName = "";
    if (lines[0] && !/\d|@/.test(lines[0]) && lines[0].split(/\s+/).length <= 5) {
        fullName = lines[0];
    }

    let location = "";
    const locationLine = lines.find((line) => !line.includes("@") && !/https?:\/\//i.test(line) && /,/.test(line));
    if (locationLine) {
        location = locationLine;
    }

    return {
        fullName,
        targetRole: fallbackTargetRole,
        email: emailMatch ? emailMatch[0] : "",
        phone: phoneMatch ? phoneMatch[0].trim() : "",
        location,
        website: websiteMatch ? websiteMatch[0].trim() : ""
    };
}

function parseResumeTextToBlocks(resumeText) {
    if (!normalizeString(resumeText)) {
        return [];
    }

    const sections = {
        header: []
    };
    let currentSection = "header";

    resumeText.split(/\r?\n/).forEach((rawLine) => {
        const line = rawLine.trim();
        const detectedSection = detectResumeSectionKey(line);
        if (detectedSection) {
            currentSection = detectedSection;
            if (!sections[currentSection]) {
                sections[currentSection] = [];
            }
            return;
        }

        if (!sections[currentSection]) {
            sections[currentSection] = [];
        }
        sections[currentSection].push(rawLine);
    });

    const blocks = [];

    const summaryText = normalizeString(
        (sections.summary || [])
            .map((line) => normalizeString(line))
            .filter(Boolean)
            .join(" ")
    );
    if (summaryText) {
        blocks.push({ type: "summary", val1: summaryText, val2: "", bullets: [] });
    }

    const experienceGroups = splitSectionGroups(sections.experience || []);
    experienceGroups.slice(0, 2).forEach((group) => {
        const headerLines = group.filter((line) => !/^[•*\-]/.test(line.trim()));
        const bulletLines = group.filter((line) => /^[•*\-]/.test(line.trim()));
        const { role, company } = parseRoleCompanyLine(headerLines[0] || "");
        const fallbackSecondLine = normalizeString(headerLines[1] || "");
        blocks.push({
            type: "experience",
            val1: company || fallbackSecondLine,
            val2: role || normalizeString(headerLines[0] || ""),
            bullets: normalizeBulletItems(
                bulletLines.length
                    ? bulletLines.join("\n")
                    : headerLines.slice(1).join("\n")
            ).slice(0, 4)
        });
    });

    const projectGroups = splitSectionGroups(sections.project || []);
    projectGroups.slice(0, 2).forEach((group) => {
        const headerLine = normalizeString(group[0] || "");
        const bulletText = group.slice(1).join("\n");
        if (headerLine || bulletText) {
            blocks.push({
                type: "project",
                val1: headerLine,
                val2: "",
                bullets: normalizeBulletItems(bulletText).slice(0, 3)
            });
        }
    });

    const skillTokens = uniqueStrings(
        (sections.skills || [])
            .flatMap((line) =>
                /^[•*\-]/.test(line.trim())
                    ? [line.replace(/^[•*\-]\s*/, "").trim()]
                    : tokenizeCommaSeparatedLine(line)
            )
    );
    if (skillTokens.length) {
        blocks.push({
            type: "skills",
            val1: skillTokens.join(", "),
            val2: "",
            bullets: []
        });
    }

    const educationGroups = splitSectionGroups(sections.education || []);
    const educationGroup = educationGroups[0] || [];
    if (educationGroup.length) {
        const degreeLine = normalizeString(educationGroup[0] || "");
        const institutionLine = normalizeString(educationGroup[1] || "");
        blocks.push({
            type: "education",
            val1: institutionLine || degreeLine,
            val2: degreeLine && institutionLine ? degreeLine : normalizeString(educationGroup[1] || ""),
            bullets: []
        });
    }

    const languageTokens = uniqueStrings(
        (sections.language || []).flatMap((line) => tokenizeCommaSeparatedLine(line))
    );
    if (languageTokens.length) {
        blocks.push({
            type: "language",
            val1: languageTokens.join(", "),
            val2: "",
            bullets: []
        });
    }

    const certificationGroups = splitSectionGroups(sections.certification || []);
    certificationGroups.slice(0, 2).forEach((group) => {
        const title = normalizeString(group[0] || "");
        const provider = normalizeString(group[1] || "");
        if (title || provider) {
            blocks.push({
                type: "certification",
                val1: title,
                val2: provider,
                bullets: []
            });
        }
    });

    const awardItems = normalizeBulletItems((sections.award || []).join("\n"));
    if (awardItems.length) {
        blocks.push({
            type: "award",
            val1: "",
            val2: "",
            bullets: awardItems.slice(0, 4)
        });
    }

    return blocks.filter((block) => block.val1 || block.val2 || (block.bullets && block.bullets.length));
}

function uniqueStrings(values) {
    return [...new Set(values.map((item) => normalizeString(item)).filter(Boolean))];
}

function sourceSupportsKeyword(sourceText, keywordTerm) {
    const normalizedSource = normalizeString(sourceText).toLowerCase();
    if (!normalizedSource) {
        return false;
    }

    const tokens = normalizeString(keywordTerm)
        .toLowerCase()
        .split(/[^a-z0-9+#.]+/)
        .filter((token) => token.length >= 3);

    return tokens.some((token) => normalizedSource.includes(token));
}

function createAtsFriendlySummary(targetRole, sourceSummary, sourceText, keywordTerms) {
    if (sourceSummary) {
        const conciseSummary = sourceSummary.replace(/\s+/g, " ").trim();
        if (conciseSummary.length >= 70) {
            return conciseSummary;
        }
    }

    const supportedKeywords = keywordTerms.filter((term) => sourceSupportsKeyword(sourceText, term)).slice(0, 4);
    const keywordPhrase = supportedKeywords.length
        ? ` Skilled in ${supportedKeywords.join(", ")}.`
        : "";

    return `ATS-focused ${targetRole} with experience translating prior resume content into concise, impact-driven achievements aligned to target hiring keywords.${keywordPhrase}`;
}

function buildOfflineATSRewritePayload({
    targetRole,
    company,
    jobDescription,
    resumeData,
    resumeText,
    extractedText
}) {
    const resolvedRole = normalizeString(targetRole) || "Professional";
    const sourceText = [resumeText, extractedText, buildResumeDataContext(resumeData)]
        .map((item) => normalizeString(item))
        .filter(Boolean)
        .join("\n\n");
    const parsedTextBlocks = parseResumeTextToBlocks(sourceText);
    const parsedResumeDataBlocks = normalizeResumeBlocks(resumeData?.blocks);
    const baseBlocks = parsedResumeDataBlocks.length ? parsedResumeDataBlocks : parsedTextBlocks;
    const match = getLocalMatch(resolvedRole);
    const sourceSummary =
        normalizeString(resumeData?.summary) ||
        normalizeString(
            parsedTextBlocks.find((block) => block.type === "summary")?.val1
        );

    const basics = {
        ...extractBasicsFromResumeText(sourceText, resolvedRole),
        fullName: normalizeString(resumeData?.fullName) || extractBasicsFromResumeText(sourceText, resolvedRole).fullName,
        targetRole: resolvedRole,
        email: normalizeString(resumeData?.email) || extractBasicsFromResumeText(sourceText, resolvedRole).email,
        phone: normalizeString(resumeData?.phone) || extractBasicsFromResumeText(sourceText, resolvedRole).phone,
        location: normalizeString(resumeData?.location) || extractBasicsFromResumeText(sourceText, resolvedRole).location,
        website: normalizeString(resumeData?.website) || extractBasicsFromResumeText(sourceText, resolvedRole).website
    };

    const keywordTerms = uniqueStrings([
        ...match.keywords.map((item) => item.term),
        ...tokenizeCommaSeparatedLine(normalizeString(jobDescription).replace(/\n/g, ","))
    ]).slice(0, 12);

    const blocks = [];

    blocks.push({
        type: "summary",
        val1: createAtsFriendlySummary(resolvedRole, sourceSummary, `${sourceText}\n${jobDescription || ""}`, keywordTerms),
        val2: "",
        bullets: []
    });

    const sourceExperienceBlocks = baseBlocks.filter((block) => block.type === "experience").slice(0, 2);
    if (sourceExperienceBlocks.length) {
        sourceExperienceBlocks.forEach((block) => {
            blocks.push({
                type: "experience",
                val1: block.val1 || company || match.data.company,
                val2: block.val2 || resolvedRole,
                bullets: (block.bullets && block.bullets.length
                    ? block.bullets
                    : normalizeBulletItems(match.data.bullets)
                ).slice(0, 4)
            });
        });
    } else {
        blocks.push({
            type: "experience",
            val1: company || match.data.company,
            val2: resolvedRole,
            bullets: normalizeBulletItems(match.data.bullets).slice(0, 3)
        });
    }

    baseBlocks
        .filter((block) => block.type === "project")
        .slice(0, 2)
        .forEach((block) => {
            blocks.push({
                type: "project",
                val1: block.val1,
                val2: "",
                bullets: block.bullets.slice(0, 3)
            });
        });

    const sourceSkills = uniqueStrings([
        ...baseBlocks
            .filter((block) => block.type === "skills")
            .flatMap((block) => tokenizeCommaSeparatedLine(block.val1)),
        ...keywordTerms.filter((term) => sourceSupportsKeyword(`${sourceText}\n${jobDescription || ""}`, term))
    ]);
    blocks.push({
        type: "skills",
        val1: (sourceSkills.length ? sourceSkills : tokenizeCommaSeparatedLine(match.data.skills)).slice(0, 14).join(", "),
        val2: "",
        bullets: []
    });

    const educationBlock = baseBlocks.find((block) => block.type === "education");
    if (educationBlock) {
        blocks.push({
            type: "education",
            val1: educationBlock.val1,
            val2: educationBlock.val2,
            bullets: []
        });
    }

    baseBlocks
        .filter((block) => block.type === "certification")
        .slice(0, 2)
        .forEach((block) => {
            blocks.push({
                type: "certification",
                val1: block.val1,
                val2: block.val2,
                bullets: []
            });
        });

    const languageBlock = baseBlocks.find((block) => block.type === "language");
    if (languageBlock) {
        blocks.push({
            type: "language",
            val1: languageBlock.val1,
            val2: "",
            bullets: []
        });
    }

    const awardBlock = baseBlocks.find((block) => block.type === "award");
    if (awardBlock && awardBlock.bullets.length) {
        blocks.push({
            type: "award",
            val1: "",
            val2: "",
            bullets: awardBlock.bullets.slice(0, 4)
        });
    }

    return normalizeAIResumePayload({
        basics,
        blocks
    }, resolvedRole);
}

// Helper: Query OpenAI GPT Model
async function callOpenAI(apiKey, systemPrompt, userPrompt) {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: OPENAI_MODEL,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`OpenAI HTTP ${response.status}: ${errBody}`);
        }

        const data = await response.json();
        const contentStr = data.choices[0].message.content;
        return JSON.parse(contentStr);
    } catch (err) {
        console.error("OpenAI API call failed:", err.message);
        throw err;
    }
}

// Helper: Query OpenAI Vision Model
async function callOpenAIMultimodal(apiKey, systemPrompt, userPrompt, base64ImageWithPrefix) {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: OPENAI_MODEL,
                messages: [
                    { role: "system", content: systemPrompt },
                    { 
                        role: "user", 
                        content: [
                            { type: "text", text: userPrompt },
                            { type: "image_url", image_url: { url: base64ImageWithPrefix } }
                        ]
                    }
                ],
                response_format: { type: "json_object" },
                temperature: 0.4
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`OpenAI Vision HTTP ${response.status}: ${errBody}`);
        }

        const data = await response.json();
        const contentStr = data.choices[0].message.content;
        return JSON.parse(contentStr); 
    } catch (err) {
        console.error("OpenAI Vision API call failed:", err.message);
        throw err;
    }
}

const geminiClientCache = new Map();

function getGeminiClient(apiKey) {
    if (!geminiClientCache.has(apiKey)) {
        geminiClientCache.set(apiKey, new GoogleGenerativeAI(apiKey));
    }
    return geminiClientCache.get(apiKey);
}

function parseGeminiJsonResponse(rawText, model) {
    const normalizedText = (rawText || "").trim();
    const fencedText = normalizedText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

    const extractBalancedJsonObject = (text) => {
        const start = text.indexOf("{");
        if (start === -1) {
            return "";
        }

        let depth = 0;
        let inString = false;
        let escaped = false;

        for (let index = start; index < text.length; index += 1) {
            const char = text[index];

            if (inString) {
                if (escaped) {
                    escaped = false;
                    continue;
                }
                if (char === "\\") {
                    escaped = true;
                    continue;
                }
                if (char === "\"") {
                    inString = false;
                }
                continue;
            }

            if (char === "\"") {
                inString = true;
                continue;
            }

            if (char === "{") {
                depth += 1;
                continue;
            }

            if (char === "}") {
                depth -= 1;
                if (depth === 0) {
                    return text.slice(start, index + 1);
                }
            }
        }

        return "";
    };

    const parseCandidates = [
        normalizedText,
        fencedText,
        extractBalancedJsonObject(fencedText)
    ];

    const firstBrace = fencedText.indexOf("{");
    const lastBrace = fencedText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        parseCandidates.push(fencedText.slice(firstBrace, lastBrace + 1));
    }

    try {
        for (const candidate of parseCandidates) {
            if (!candidate) {
                continue;
            }
            try {
                return JSON.parse(candidate);
            } catch (_err) {
                // Try the next normalization strategy.
            }
        }
        throw new Error("No valid JSON candidate found");
    } catch (err) {
        const preview = normalizedText ? normalizedText.slice(0, 300) : "";
        throw new Error(`Gemini returned non-JSON output (${model}): ${preview}`);
    }
}

async function generateGeminiContentWithRetry(model, request, attempts = 2) {
    let lastErr;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            const result = await model.generateContent(request);
            const response = await result.response;
            return {
                text: response.text().trim(),
                finishReason: response.candidates?.[0]?.finishReason || "",
                response
            };
        } catch (err) {
            lastErr = err;
            if (attempt >= attempts) {
                break;
            }
            await new Promise((resolve) => setTimeout(resolve, 350 * attempt));
        }
    }

    throw lastErr;
}

function getGeminiModelCandidates() {
    const models = [];
    const envModel = process.env.GEMINI_MODEL?.trim();
    if (envModel) {
        models.push(envModel);
    }
    models.push(GEMINI_MODEL_DEFAULT, ...GEMINI_MODEL_FALLBACKS);
    return [...new Set(models.filter(Boolean))];
}

function isGeminiModelNotFound(status, errBody) {
    return status === 404 && /not found|not supported/i.test(errBody);
}

async function callGeminiOnce(apiKey, systemInstruction, promptText, model) {
    try {
        const client = getGeminiClient(apiKey);
        const geminiModel = client.getGenerativeModel({ model });
        const requestText = `${systemInstruction}\n\nUser Input:\n${promptText}`;

        const tryGeminiRequest = async (overrideText, generationConfig) => {
            const result = await generateGeminiContentWithRetry(geminiModel, {
                contents: [{
                    role: "user",
                    parts: [{
                        text: overrideText
                    }]
                }],
                generationConfig
            });
            return parseGeminiJsonResponse(result.text, model);
        };

        try {
            return await tryGeminiRequest(requestText, {
                responseMimeType: "application/json",
                temperature: 0.25,
                maxOutputTokens: 4096
            });
        } catch (primaryErr) {
            const compactRetryText = `${requestText}\n\nCompactness override:\nReturn shorter ATS-safe JSON. Limit to 1 summary block, up to 2 experience blocks with 2-3 concise bullets each, up to 2 project blocks with 2 bullets each, 8-14 comma-separated skills, 1 education block, up to 2 certification blocks, 1 language block, and 1 award block. Keep each bullet under 22 words.`;
            return await tryGeminiRequest(compactRetryText, {
                responseMimeType: "application/json",
                temperature: 0.15,
                maxOutputTokens: 4096
            });
        }
    } catch (err) {
        const status = err?.status || err?.statusCode || err?.cause?.status;
        const errText = err?.message || "";
        err.isModelNotFound = isGeminiModelNotFound(status, errText);
        throw err;
    }
}

// Helper: Query Gemini model with fallback models
async function callGemini(apiKey, systemInstruction, promptText) {
    const models = getGeminiModelCandidates();
    let lastErr;
    for (const model of models) {
        try {
            return await callGeminiOnce(apiKey, systemInstruction, promptText, model);
        } catch (err) {
            if (err.isModelNotFound) {
                console.warn(`[AI Core] Gemini model "${model}" not available, trying next...`);
                lastErr = err;
                continue;
            }
            lastErr = err;
            break;
        }
    }
    console.error("Gemini API call failed:", lastErr?.message);
    throw lastErr;
}

async function callGeminiMultimodalOnce(apiKey, systemInstruction, promptText, base64Image, mimeType, model) {
    try {
        const client = getGeminiClient(apiKey);
        const geminiModel = client.getGenerativeModel({ model });
        const requestText = `${systemInstruction}\n\nUser Input:\n${promptText}`;

        const tryGeminiMultimodalRequest = async (overrideText, generationConfig) => {
            const result = await generateGeminiContentWithRetry(geminiModel, {
                contents: [{
                    role: "user",
                    parts: [
                        {
                            text: overrideText
                        },
                        {
                            inlineData: {
                                mimeType,
                                data: base64Image
                            }
                        }
                    ]
                }],
                generationConfig
            });
            return parseGeminiJsonResponse(result.text, model);
        };

        try {
            return await tryGeminiMultimodalRequest(requestText, {
                responseMimeType: "application/json",
                temperature: 0.2,
                maxOutputTokens: 4096
            });
        } catch (primaryErr) {
            const compactRetryText = `${requestText}\n\nCompactness override:\nReturn shorter ATS-safe JSON. Limit to 1 summary block, up to 2 experience blocks with 2-3 concise bullets each, up to 2 project blocks with 2 bullets each, 8-14 comma-separated skills, 1 education block, up to 2 certification blocks, 1 language block, and 1 award block. Keep each bullet under 22 words.`;
            return await tryGeminiMultimodalRequest(compactRetryText, {
                responseMimeType: "application/json",
                temperature: 0.1,
                maxOutputTokens: 4096
            });
        }
    } catch (err) {
        const status = err?.status || err?.statusCode || err?.cause?.status;
        const errText = err?.message || "";
        err.isModelNotFound = isGeminiModelNotFound(status, errText);
        throw err;
    }
}

// Helper: Query Gemini Multimodal with fallback models
async function callGeminiMultimodal(apiKey, systemInstruction, promptText, base64Image, mimeType) {
    const models = getGeminiModelCandidates();
    let lastErr;
    for (const model of models) {
        try {
            return await callGeminiMultimodalOnce(apiKey, systemInstruction, promptText, base64Image, mimeType, model);
        } catch (err) {
            if (err.isModelNotFound) {
                console.warn(`[AI Core] Gemini model "${model}" not available for multimodal, trying next...`);
                lastErr = err;
                continue;
            }
            lastErr = err;
            break;
        }
    }
    throw lastErr;
}

// ============================================================================
// CORE ROUTE MIDDLEWARES (With Clean Key Routing & Integrated Fallbacks)
// ============================================================================

const simulateAIExtension = async (req, res, next) => {
    const { targetRole, company, resumeImage, jobDescription, resumeData } = req.body;
    
    if (!targetRole && !resumeImage) {
        return res.status(400).json({ error: "Missing payload parameter: targetRole or resumeImage" });
    }

    const providerCandidates = getProviderCandidates(req);
    req.aiUsedRealProvider = false;

    const resolvedTargetRole =
        normalizeString(targetRole) ||
        normalizeString(resumeData?.targetRole) ||
        "Software Engineer";
    const recruiterKeywordHints = getLocalMatch(resolvedTargetRole).keywords
        .map((item) => item.term)
        .slice(0, 8)
        .join(", ");
    const currentResumeContext = buildResumeDataContext(resumeData);
    const jobContext = normalizeString(jobDescription);

    const systemPrompt = `Act as an ATS expert recruiter and resume writer.
Your job is to rewrite the candidate's resume into a complete 1-page ATS-friendly resume tailored for the target role.
Maximize ATS match, add missing keywords only when they are supported by the source resume or provided draft, keep the writing concise, and quantify impact using numbers when possible without inventing facts.
Use ATS-safe structure: no tables, no icons, no decorative text, no multi-column assumptions, no fake achievements, and no unsupported tools or certifications.

You MUST respond with one strict valid JSON object containing exactly these top-level keys:
{
  "basics": {
    "fullName": "Person name or empty string",
    "targetRole": "Best matching role title",
    "email": "Email or empty string",
    "phone": "Phone or empty string",
    "location": "Location or empty string",
    "website": "Website or portfolio URL or empty string"
  },
  "blocks": [
    {
      "type": "summary | experience | project | skills | education | language | certification | award",
      "val1": "Primary field value for that block type",
      "val2": "Secondary field value for that block type, otherwise empty string",
      "bullets": ["Bullet 1", "Bullet 2"]
    }
  ]
}

Rules:
- Use only the allowed block "type" values.
- Keep blocks in natural top-to-bottom resume order.
- Build a complete resume, not just a few sample sections.
- Prefer including summary, multiple experiences when available, projects when available, skills, education, certifications, languages, and awards when supported by the source.
- Make the content ATS-friendly for the target role and naturally incorporate relevant recruiter keywords when truthful.
- Keep the resume concise enough for a strong 1-page version.
- Keep the JSON compact: 1 summary block, up to 2 experience blocks, up to 2 project blocks, 1 skills block, 1 education block, up to 2 certification blocks, 1 language block, and 1 award block.
- Keep each bullet short and ATS-friendly. Prefer 2-3 bullets per experience/project block.
- For "summary", store the paragraph in val1 and use an empty bullets array.
- For "experience", use val1 as company, val2 as role, bullets as achievements.
- For "project", use val1 as project name, val2 as empty string, bullets as highlights.
- For "skills", use val1 as a comma-separated skills line.
- For "education", use val1 as institution and val2 as degree.
- For "language", use val1 as a comma-separated languages line.
- For "certification", use val1 as certification title and val2 as provider.
- For "award", keep val1 and val2 empty and put each award in bullets.
- If a section is missing, omit that block instead of inventing extra content.
- If source contact details are present, preserve them in basics.
- For PDF/photo extraction, preserve as many real sections as possible from the source document.`;

    const isPDF = resumeImage && resumeImage.includes("application/pdf");
    const userPromptParts = [
        `Target Job Role: "${resolvedTargetRole}"`,
        company ? `Target Company: "${company}"` : "",
        recruiterKeywordHints
            ? `ATS Keyword Targets: ${recruiterKeywordHints}`
            : "",
        jobContext
            ? `Job Description / Recruiter Notes:\n${jobContext}`
            : "",
        currentResumeContext
            ? `Current Resume Draft Data:\n${currentResumeContext}`
            : ""
    ].filter(Boolean);

    if (resumeImage) {
        userPromptParts.unshift(
            isPDF
                ? `Read the attached PDF resume, extract as many real sections as possible, and rewrite it into a complete ATS-friendly 1-page resume for the target role.`
                : `Read the attached resume image, extract as many real sections as possible, and rewrite it into a complete ATS-friendly 1-page resume for the target role.`
        );
    } else {
        userPromptParts.unshift(
            `Rewrite the candidate's resume into a complete ATS-friendly 1-page resume for the target role. If source sections are missing, use the existing draft data provided here.`
        );
    }

    userPromptParts.push(
        `Priority instruction: maximize ATS match for the target role, keep claims truthful, add role-relevant keywords only when supported, and quantify impact where possible. Aim for an ATS score above 80% once contact details and keywords are present.`
    );

    const userPrompt = userPromptParts.join("\n\n");

    if (providerCandidates.length) {
        const { result, providerCandidate, error, lastAttempt } =
            await runWithProviderCandidates(
                providerCandidates,
                async ({ provider, apiKey }) => {
                    if (resumeImage) {
                        const base64Data = resumeImage.split(",")[1] || resumeImage;
                        const mimeType = resumeImage.match(/data:([^;]+);/)?.[1] || "image/jpeg";

                        if (isPDF) {
                            const extractedText = await extractPdfTextFromBase64(base64Data);
                            const pdfPrompt = `${userPrompt}\n\n[Extracted PDF Text]:\n${extractedText}`;
                            return provider === "gemini"
                                ? await callGemini(apiKey, systemPrompt, pdfPrompt)
                                : await callOpenAI(apiKey, systemPrompt, pdfPrompt);
                        }

                        return provider === "gemini"
                            ? await callGeminiMultimodal(apiKey, systemPrompt, userPrompt, base64Data, mimeType)
                            : await callOpenAIMultimodal(apiKey, systemPrompt, userPrompt, resumeImage);
                    }

                    return provider === "gemini"
                        ? await callGemini(apiKey, systemPrompt, userPrompt)
                        : await callOpenAI(apiKey, systemPrompt, userPrompt);
                },
                "Resume AI generation"
            );

        if (providerCandidate) {
            req.aiGeneratedPayload = normalizeAIResumePayload(result, resolvedTargetRole);
            applyProviderSuccessMetadata(req, providerCandidate);
            return next();
        }

        applyProviderFallbackMetadata(req, providerCandidates, lastAttempt, error);
        console.error("[AI Core] Live API compilation failed, shifting dynamically to local metrics adapter:", error?.message);
    } else {
        applyProviderFallbackMetadata(req, providerCandidates);
    }

    // Dynamic offline semantic database engine fallback
    console.log(`[AI Core] Running dynamic offline semantic adapter for target role: "${targetRole}"`);
    const extractedRole = resolvedTargetRole || "Full Stack Developer";
    const match = getLocalMatch(extractedRole);
    
    const finalPayload = normalizeAIResumePayload({
        basics: {
            fullName: "",
            targetRole: extractedRole,
            email: "",
            phone: "",
            location: "",
            website: ""
        },
        blocks: [
            {
                type: "summary",
                val1: match.data.summary.replace(/Lead Systems Developer/g, extractedRole).replace(/Vortex Tech Solutions/g, company || "Nexus Enterprises"),
                val2: "",
                bullets: []
            },
            {
                type: "experience",
                val1: company || match.data.company,
                val2: match.data.role.replace(/Systems Developer/g, extractedRole),
                bullets: normalizeBulletItems(match.data.bullets)
            },
            {
                type: "skills",
                val1: match.data.skills,
                val2: "",
                bullets: []
            },
            {
                type: "education",
                val1: "Shri Ramswaroop Memorial University",
                val2: match.data.degree || "Master of Computer Applications (MCA)",
                bullets: []
            },
            {
                type: "certification",
                val1: match.data.certifications,
                val2: match.data.provider,
                bullets: []
            }
        ]
    }, extractedRole);

    req.aiGeneratedPayload = finalPayload;
    next();
};

const generateATSKeywords = async (req, res) => {
    const { targetRole, useLiveAI } = req.body;
    
    if (!targetRole) {
        return res.status(400).json({ error: "Missing payload parameter: targetRole" });
    }

    const providerCandidates = getProviderCandidates(req);

    const systemPrompt = `You are a premium applicant tracking system (ATS) optimization engine.
Provide a lists of high-scoring applicant tracking keywords, match score percentages (0-100), and short placement suggestions.
You MUST respond with a strict valid JSON object containing exactly the following schema:
{
    "keywords": [
        { "term": "Keyword term", "score": 98, "context": "Detailed tip of how to integrate this term" }
    ]
}
Return between 5 and 7 highly relevant industry-specific terms.`;

    const userPrompt = `Provide applicant tracking keywords to help parse highly for target role: "${targetRole}".`;

    if (useLiveAI === true && providerCandidates.length) {
        const { result, error } = await runWithProviderCandidates(
            providerCandidates,
            async ({ provider, apiKey }) => (
                provider === "gemini"
                    ? await callGemini(apiKey, systemPrompt, userPrompt)
                    : await callOpenAI(apiKey, systemPrompt, userPrompt)
            ),
            "ATS keyword generation"
        );

        if (result) {
            return res.status(200).json({ success: true, keywords: result.keywords });
        }

        console.warn("[AI Core] Live Key ATS Keyword generation failed, loading matching placeholder configurations:", error?.message);
    }

    // Dynamic offline semantic engine fallback for ATS Keywords
    const match = getLocalMatch(targetRole);
    return res.status(200).json({ success: true, keywords: match.keywords });
};

const checkATSScore = async (req, res) => {
    const { targetRole, resumeData, useLiveAI } = req.body;
    
    if (!targetRole || !resumeData) {
        return res.status(400).json({ error: "Missing parameters: targetRole and resumeData are required" });
    }

    const providerCandidates = getProviderCandidates(req);

    const systemPrompt = `You are a premium applicant tracking system (ATS) optimization engine.
Analyze the provided resume contents against the target career role and calculate a compatibility percentage score (0-100).
Produce a strict valid JSON object containing exactly the following schema:
{
    "score": 85,
    "highlights": [
        "Include a bulleted list of 3-5 specific recommendations, missing keywords, and layout optimizations"
    ]
}`;

    const userPrompt = `Target Role: "${targetRole}"\nResume Data:\n${JSON.stringify(resumeData, null, 2)}`;

    if (useLiveAI === true && providerCandidates.length) {
        const { result, error } = await runWithProviderCandidates(
            providerCandidates,
            async ({ provider, apiKey }) => (
                provider === "gemini"
                    ? await callGemini(apiKey, systemPrompt, userPrompt)
                    : await callOpenAI(apiKey, systemPrompt, userPrompt)
            ),
            "ATS score generation"
        );

        if (result) {
            return res.status(200).json({ success: true, score: result.score, highlights: result.highlights });
        }

        console.warn("[AI Core] Live Key ATS calculation error. Initiating deterministic math calculations framework:", error?.message);
    }

    // Dynamic Local Scorer Fallback Engine
    const match = getLocalMatch(targetRole);
    const fullText = (
        (resumeData.fullName || "") + " " +
        (resumeData.targetRole || "") + " " +
        (resumeData.contactLine || "") + " " +
        (resumeData.summary || "") + " " +
        (resumeData.blocks || []).map(b => (b.val1 || "") + " " + (b.val2 || "") + " " + (b.bullets || "")).join(" ")
    ).toLowerCase();

    let matchedKeywords = [];
    let missingKeywords = [];
    
    match.keywords.forEach(kw => {
        if (fullText.includes(kw.term.toLowerCase())) {
            matchedKeywords.push(kw.term);
        } else {
            missingKeywords.push(kw.term);
        }
    });

    let keywordScore = Math.round((matchedKeywords.length / Math.max(1, match.keywords.length)) * 60); 
    let structuralScore = 0; 
    let highlights = [];

    if (resumeData.contactLine && resumeData.contactLine.includes("@")) structuralScore += 15;
    else highlights.push("❌ Contact Information: Add a valid email address so recruiters can contact you.");

    if (resumeData.contactLine && resumeData.contactLine.includes("|")) structuralScore += 15;
    else highlights.push("⚠️ Contact Information: Use pipe separators (|) to clearly separate phone and location fields.");

    if ((resumeData.summary || "").trim().length >= 40) structuralScore += 10;
    else highlights.push("⚠️ Professional Summary: Write a descriptive profile abstract to clear parse screening thresholds.");

    if (missingKeywords.length > 0) {
        highlights.push(`💡 Missing Key Terms: Try to incorporate industry keywords like: "${missingKeywords.slice(0, 3).join(", ")}".`);
    } else {
        highlights.push("🎉 Outstanding Keyword Density! All premium matching keywords exist in your resume data structure.");
    }

    const finalScore = Math.min(100, keywordScore + structuralScore);
    return res.status(200).json({ success: true, score: finalScore, highlights });
};

const generatePortfolioData = async (req, res, next) => {
    try {
        const { targetRole, resumeId, resumeData, resumeImage } = req.body;
        req.aiUsedRealProvider = false;
        
        let finalRole = targetRole || "Software Engineer";
        let fullName = "Alex Rivera";
        let email = "alex.rivera@dev.io";
        let phone = "+1 (555) 234-5678";
        let location = "San Francisco, CA";
        let summaryText = "";
        let extractedSkills = [];
        let extractedExp = [];
        let extractedProj = [];
        let extractedEdu = [];
        let extractedCerts = [];
        let extractedLanguages = [];
        let extractedAwards = [];
        let sourceBlocks = [];

        const capturePortfolioBlock = (block) => {
            const blockType = normalizeString(block?.blockType || block?.type).toLowerCase();
            if (!blockType) {
                return;
            }

            if (blockType === 'summary') {
                summaryText = normalizeString(block?.val1) || summaryText;
                return;
            }

            if (blockType === 'skills') {
                const skillsValue = normalizeString(block?.val1 || block?.bullets);
                if (skillsValue) {
                    extractedSkills.push(skillsValue);
                }
                return;
            }

            if (blockType === 'experience') {
                extractedExp.push({
                    role: normalizeString(block?.val2 || block?.role || block?.title),
                    company: normalizeString(block?.val1 || block?.company),
                    duration: normalizeString(block?.duration) || (block?.bullets ? normalizeString(block.bullets).split('\n')[0] : "2023 - Present"),
                    description: normalizeString(block?.bullets || block?.description || "")
                });
                return;
            }

            if (blockType === 'project') {
                extractedProj.push({
                    title: normalizeString(block?.val1 || block?.title),
                    description: normalizeString(block?.val2 || block?.description || ""),
                    tags: normalizeString(block?.bullets || block?.tags || ""),
                    githubLink: "#",
                    liveLink: "#"
                });
                return;
            }

            if (blockType === 'education') {
                extractedEdu.push({
                    institution: normalizeString(block?.val1 || block?.institution),
                    degree: normalizeString(block?.val2 || block?.degree)
                });
                return;
            }

            if (blockType === 'certification') {
                extractedCerts.push({
                    title: normalizeString(block?.val1 || block?.title),
                    provider: normalizeString(block?.val2 || block?.provider)
                });
                return;
            }

            if (blockType === 'language') {
                const languageValue = normalizeString(block?.val1 || block?.bullets);
                if (languageValue) {
                    extractedLanguages.push(languageValue);
                }
                return;
            }

            if (blockType === 'award') {
                const awardItems = normalizeBulletItems(block?.bullets || block?.val1 || block?.val2);
                if (awardItems.length) {
                    extractedAwards.push(...awardItems);
                }
            }
        };

        if (resumeId) {
            try {
                const Resume = require('../models/Resume');
                const resumeObj = await Resume.findById(resumeId);
                if (resumeObj) {
                    fullName = resumeObj.fullName || fullName;
                    finalRole = resumeObj.targetRole || finalRole;
                    email = resumeObj.email || email;
                    phone = resumeObj.phone || phone;
                    location = resumeObj.location || location;

                    sourceBlocks = Array.isArray(resumeObj.blocksData) && resumeObj.blocksData.length > 0
                        ? resumeObj.blocksData
                        : Array.isArray(resumeObj.autoSaveData?.blocksData)
                            ? resumeObj.autoSaveData.blocksData
                            : Array.isArray(resumeObj.autoSaveData?.blocks)
                                ? resumeObj.autoSaveData.blocks
                                : [];

                    sourceBlocks.forEach(capturePortfolioBlock);

                    if (!summaryText && Array.isArray(sourceBlocks) && sourceBlocks.length > 0) {
                        const summaryBlock = sourceBlocks.find((block) => (block.blockType || block.type) === 'summary');
                        summaryText = normalizeString(summaryBlock?.val1);
                    }
                }
            } catch (err) {
                console.warn("[AI Portfolio] Error loading resume to seed:", err.message);
            }
        } else if (resumeData) {
            fullName = resumeData.fullName || fullName;
            finalRole = resumeData.targetRole || finalRole;
            email = resumeData.email || email;
            phone = resumeData.phone || phone;
            location = resumeData.location || location;
            summaryText = resumeData.summary || summaryText;
            
            sourceBlocks = Array.isArray(resumeData.blocksData) && resumeData.blocksData.length > 0
                ? resumeData.blocksData
                : Array.isArray(resumeData.blocks)
                    ? resumeData.blocks
                    : [];

            sourceBlocks.forEach(capturePortfolioBlock);

            if (!summaryText && sourceBlocks.length > 0) {
                const summaryBlock = sourceBlocks.find((block) => (block.blockType || block.type) === 'summary');
                summaryText = normalizeString(summaryBlock?.val1);
            }
        }

        const sourceResumeContext = buildResumeDataContext({
            fullName,
            targetRole: finalRole,
            email,
            phone,
            location,
            summary: summaryText,
            blocks: normalizeResumeBlocks(sourceBlocks)
        });

        const providerCandidates = getProviderCandidates(req);

        const systemPrompt = `You are a premium Portfolio Synthesis AI engine.
Your task is to convert professional resume contents into an outstanding, creative, and production-ready portfolio database config JSON.
You MUST respond with a strict, valid JSON object containing exactly the following schema:
{
    "fullName": "Full Name",
    "targetRole": "Professional Title / Role",
    "bio": "A punchy, professional, and exciting profile introduction bio (approx 2-3 sentences).",
    "contact": { "email": "Email", "phone": "Phone", "github": "#", "linkedin": "#", "twitter": "#" },
    "skills": [ { "category": "Category Name", "items": "Skills (comma-separated)" } ],
    "projects": [ { "title": "Project Title", "description": "Description", "tags": "Tags", "githubLink": "#", "liveLink": "#" } ],
    "experience": [ { "role": "Role", "company": "Company", "duration": "2023-Present", "description": "Highlight" } ]
}`;

        let userPrompt = `Synthesize a premium portfolio config JSON for: Full Name: "${fullName}", Target Career Role: "${finalRole}"\n\nExisting Resume Snapshot:\n${sourceResumeContext}`;

        if (providerCandidates.length) {
            const { result, providerCandidate, error, lastAttempt } =
                await runWithProviderCandidates(
                    providerCandidates,
                    async ({ provider, apiKey }) => {
                        if (provider === "gemini") {
                            if (resumeImage) {
                                const base64Data = resumeImage.split(",")[1] || resumeImage;
                                const mimeType = resumeImage.match(/data:([^;]+);/)?.[1] || "image/jpeg";
                                return await callGeminiMultimodal(apiKey, systemPrompt, userPrompt, base64Data, mimeType);
                            }
                            return await callGemini(apiKey, systemPrompt, userPrompt);
                        }

                        return await callOpenAI(apiKey, systemPrompt, userPrompt);
                    },
                    "Portfolio AI generation"
                );

            if (providerCandidate) {
                req.aiGeneratedPortfolio = result;
                applyProviderSuccessMetadata(req, providerCandidate);
                return next();
            }

            applyProviderFallbackMetadata(req, providerCandidates, lastAttempt, error);
            console.warn("[AI Portfolio] Live key parsing failed, building offline response layout maps:", error?.message);
        } else {
            applyProviderFallbackMetadata(req, providerCandidates);
        }

        // Complete static configurations fallback block mapping profile parameters
        const matchCategory = finalRole.toLowerCase().includes("design") ? "designer" : "developer";
        const fallbackPortfolio = {
            fullName,
            targetRole: finalRole,
            bio: summaryText || "Results-driven professional focused on scalable architectures.",
            contact: { email, phone, github: "#", linkedin: "#", twitter: "#" },
            skills: [ { category: "Core Proficiencies", items: extractedSkills.length > 0 ? extractedSkills.join(', ') : "Node.js, Express, JavaScript, Git" } ],
            projects: extractedProj.length > 0 ? extractedProj : [ { title: "E-Commerce Layout Platform", description: "Engineered responsive full-stack transactional networks.", tags: "React, MongoDB", githubLink: "#", liveLink: "#" } ],
            experience: extractedExp.length > 0 ? extractedExp : [ { role: finalRole, company: "Enterprise Solutions", duration: "2024 - Present", description: "Optimized operational performance matrices." } ],
            education: extractedEdu,
            certifications: extractedCerts,
            languages: extractedLanguages,
            awards: extractedAwards,
            sourceResumeContext
        };

        req.aiGeneratedPortfolio = fallbackPortfolio;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { simulateAIExtension, generateATSKeywords, checkATSScore, generatePortfolioData };
