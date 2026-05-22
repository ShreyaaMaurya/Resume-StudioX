const GEMINI_API_VERSION = process.env.GEMINI_API_VERSION?.trim() || "v1";
const GEMINI_MODEL_DEFAULT = "gemini-1.5-flash-latest";
const GEMINI_MODEL_FALLBACKS = [
    "gemini-1.5-flash",
    "gemini-1.5-pro-latest",
    "gemini-1.5-pro",
    "gemini-1.0-pro"
];
const OPENAI_MODEL = "gpt-4o-mini";

// Robust API Key Resolution Helper
function getApiKey(headerVal, envVal, placeholder) {
    if (headerVal && typeof headerVal === 'string') {
        const trimmed = headerVal.trim();
        if (trimmed && 
            trimmed !== "null" && 
            trimmed !== "undefined" && 
            trimmed !== placeholder && 
            !trimmed.includes("placeholder") &&
            trimmed.length > 15
        ) {
            return trimmed;
        }
    }
    if (envVal && typeof envVal === 'string') {
        const trimmed = envVal.trim();
        if (trimmed && 
            trimmed !== placeholder && 
            !trimmed.includes("placeholder") &&
            trimmed.length > 15
        ) {
            return trimmed;
        }
    }
    return null;
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
    const url = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: `${systemInstruction}\n\nUser Input:\n${promptText}`
                }]
            }],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.7
            }
        })
    });

    if (!response.ok) {
        const errBody = await response.text();
        const err = new Error(`Gemini HTTP ${response.status} (${model}): ${errBody}`);
        err.isModelNotFound = isGeminiModelNotFound(response.status, errBody);
        throw err;
    }

    const data = await response.json();
    const rawJsonText = data.candidates[0].content.parts[0].text.trim();
    return JSON.parse(rawJsonText);
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
    const url = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${model}:generateContent?key=${apiKey}`;
        
        // Validate base64 image
        if (!base64Image || base64Image.length < 100) {
            throw new Error('Invalid image data - base64 string is empty or too small');
        }
        
        console.log(`[Gemini Multimodal] Processing image with mime type: ${mimeType}, size: ${base64Image.length} bytes`);
        
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [{
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Image
                        }
                    },
                    {
                        text: promptText
                    }
                ]
            }],
            systemInstruction: {
                parts: [{
                    text: systemInstruction
                }]
            },
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.4
            }
        })
    });

    if (!response.ok) {
        const errBody = await response.text();
        console.error(`[Gemini Multimodal] HTTP Error ${response.status}: ${errBody}`);
        const err = new Error(`Gemini Multimodal HTTP ${response.status} (${model}): ${errBody}`);
        err.isModelNotFound = isGeminiModelNotFound(response.status, errBody);
        throw err;
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response structure from Gemini');
    }
    
    const rawJsonText = data.candidates[0].content.parts[0].text.trim();
    console.log(`[Gemini Multimodal] Successfully processed image, parsing response...`);
    return JSON.parse(rawJsonText);
}

// Helper: Query Gemini Multimodal with fallback models
async function callGeminiMultimodal(apiKey, systemInstruction, promptText, base64Image, mimeType) {
    try {
        // Validate base64 image
        if (!base64Image || base64Image.length < 100) {
            throw new Error('Invalid image data - base64 string is empty or too small');
        }
        
        console.log(`[Gemini Multimodal] Processing image with mime type: ${mimeType}, size: ${base64Image.length} bytes`);
        
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
        console.error("Gemini Multimodal API call failed:", lastErr?.message);
        throw lastErr;
    } catch (err) {
        console.error("Gemini Multimodal API call failed:", err.message);
        throw err;
    }
}

// Main AI Generation Middleware
const simulateAIExtension = async (req, res, next) => {
    const { targetRole, company, resumeImage } = req.body;
    
    if (!targetRole && !resumeImage) {
        return res.status(400).json({ error: "Missing payload parameter: targetRole or resumeImage" });
    }

    const geminiKeyHeader = getApiKey(req.headers['x-gemini-key'], null, "your_gemini_api_key_here");
    const geminiKeyEnv = getApiKey(null, process.env.GEMINI_API_KEY, "your_gemini_api_key_here");
    const geminiKey = geminiKeyHeader || geminiKeyEnv;

    const openaiKeyHeader = getApiKey(req.headers['x-openai-key'], null, "your_openai_api_key_here");
    const openaiKeyEnv = getApiKey(null, process.env.OPENAI_API_KEY, "your_openai_api_key_here");
    const openaiKey = openaiKeyHeader || openaiKeyEnv;

    const useGemini = !!geminiKey;
    const useOpenAI = !!openaiKey;
    
    // Track whether we're using real AI or fallback
    req.aiUsedRealProvider = false;

    // Structural instructions for drafts
    const systemPrompt = `You are the ResumeStudio X AI engine. You draft high-fidelity resume blueprints from inputs or photo OCR extraction.
You MUST respond with a strict valid JSON object containing exactly the following schema:
{
    "summary": "Professional profile summary.",
    "experience": {
        "company": "Fictional or extracted relevant company name",
        "role": "Extracted or targeted professional role",
        "bullets": "3 high-impact bullet points separated by newline characters"
    },
    "skills": "Comma-separated list of 8-10 target skills",
    "education": {
        "institution": "University institution name",
        "degree": "Academic degree title"
    },
    "certifications": {
        "title": "High-value professional certification",
        "provider": "Respected certification provider"
    }
}`;

    const isPDF = resumeImage && resumeImage.includes("application/pdf");
    const userPrompt = resumeImage 
        ? (isPDF
            ? `Read the text from the provided PDF resume document and reconstruct it completely inside the requested JSON schema structure. Match the experience, skills, and summary to build a clean professional layout draft.`
            : `Read the text from the provided resume photo and reconstruct it completely inside the requested JSON schema structure. Make up realistic details for blurry parts, ensuring target career relevance.`)
        : `Draft a high-fidelity professional resume layout context for target role: "${targetRole}" ${company ? `at company: "${company}"` : ""}. Provide rich, realistic descriptions.`;

    if (resumeImage) {
        // Multimodal Vision / PDF OCR Requests
        const base64Data = resumeImage.split(",")[1] || resumeImage;
        const mimeType = resumeImage.match(/data:([^;]+);/)?.[1] || "image/jpeg";
        const fallbackGeminiKey = geminiKeyHeader && geminiKeyEnv && geminiKeyHeader !== geminiKeyEnv ? geminiKeyEnv : null;

        if (isPDF) {
            try {
                const extractedText = await extractPdfTextFromBase64(base64Data);
                if (extractedText.length > 50) {
                    const pdfPrompt = `${userPrompt}\n\n[Extracted PDF Text]:\n${extractedText}`;
                    if (useGemini) {
                        try {
                            const result = await callGemini(geminiKey, systemPrompt, pdfPrompt);
                            console.log(`[AI Core] ✅ Gemini text extraction succeeded (PDF)`);
                            req.aiGeneratedPayload = result;
                            req.aiUsedRealProvider = true;
                            return next();
                        } catch (pdfErr) {
                            if (fallbackGeminiKey) {
                                try {
                                    const result = await callGemini(fallbackGeminiKey, systemPrompt, pdfPrompt);
                                    console.log(`[AI Core] ✅ Gemini text extraction succeeded with server key (PDF)`);
                                    req.aiGeneratedPayload = result;
                                    req.aiUsedRealProvider = true;
                                    return next();
                                } catch (err) {
                                    console.warn("[AI Core] Fallback Gemini also failed:", err.message);
                                }
                            }
                            console.warn("[AI Core] Gemini text extraction failed (PDF):", pdfErr.message);
                        }
                    } else if (useOpenAI) {
                        try {
                            const result = await callOpenAI(openaiKey, systemPrompt, pdfPrompt);
                            console.log(`[AI Core] ✅ OpenAI text extraction succeeded (PDF)`);
                            req.aiGeneratedPayload = result;
                            req.aiUsedRealProvider = true;
                            return next();
                        } catch (err) {
                            console.warn("[AI Core] OpenAI text extraction failed:", err.message);
                        }
                    }
                } else {
                    console.warn("[AI Core] PDF text extraction returned too little content, falling back to multimodal.");
                }
            } catch (err) {
                console.warn("[AI Core] PDF text extraction failed, falling back to multimodal.", err.message);
            }
        }

        if (useGemini) {
            console.log(`[AI Core] Attempting Gemini multimodal for image (${mimeType})...`);
            try {
                const result = await callGeminiMultimodal(geminiKey, systemPrompt, userPrompt, base64Data, mimeType);
                console.log(`[AI Core] ✅ Gemini multimodal succeeded`);
                req.aiGeneratedPayload = result;
                req.aiUsedRealProvider = true;
                return next();
            } catch (err) {
                console.error("[AI Core] ❌ GEMINI MULTIMODAL FAILED:");
                console.error("  Error:", err.message);
                if (fallbackGeminiKey) {
                    console.log("[AI Core] Retrying Gemini multimodal with server key...");
                    try {
                        const result = await callGeminiMultimodal(fallbackGeminiKey, systemPrompt, userPrompt, base64Data, mimeType);
                        console.log(`[AI Core] ✅ Gemini multimodal succeeded with server key`);
                        req.aiGeneratedPayload = result;
                        req.aiUsedRealProvider = true;
                        return next();
                    } catch (fallbackErr) {
                        console.error("[AI Core] ❌ Gemini multimodal failed with server key:", fallbackErr.message);
                    }
                }
                console.log("[AI Core] Falling back to text-only generation...");
                
                // Try text-only Gemini as fallback
                try {
                    const textKey = fallbackGeminiKey || geminiKey;
                    const textPrompt = userPrompt + `\n\n[Note: Using text-based generation as image processing failed. Please generate professional resume data based on the context above.]`;
                    const result = await callGemini(textKey, systemPrompt, textPrompt);
                    console.log(`[AI Core] ✅ Text-only Gemini succeeded`);
                    req.aiGeneratedPayload = result;
                    req.aiUsedRealProvider = true;
                    return next();
                } catch (textErr) {
                    console.error("[AI Core] ❌ Text-only Gemini also failed:", textErr.message);
                }
            }
        } else if (useOpenAI) {
            if (mimeType === "application/pdf") {
                console.warn("[AI Core] OpenAI does not support direct PDF input in chat completions.");
            } else {
                console.log(`[AI Core] Attempting OpenAI Vision for image...`);
                try {
                    const result = await callOpenAIMultimodal(openaiKey, systemPrompt, userPrompt, resumeImage);
                    console.log(`[AI Core] ✅ OpenAI Vision succeeded`);
                    req.aiGeneratedPayload = result;
                    req.aiUsedRealProvider = true;
                    return next();
                } catch (err) {
                    console.error("[AI Core] ❌ OPENAI VISION FAILED:");
                    console.error("  Error:", err.message);
                }
            }
        }

        // IMPORTANT: If no AI provider is configured or all failed, return error instead of fallback
        if (!useGemini && !useOpenAI) {
            console.error("[AI Core] ❌ NO API KEY CONFIGURED - Cannot process resume image");
            console.error("[AI Core] Gemini Key:", geminiKey ? "Present" : "Missing");
            console.error("[AI Core] OpenAI Key:", openaiKey ? "Present" : "Missing");
            req.aiError = "No AI API key configured. Please add Gemini or OpenAI API key in settings.";
            return res.status(503).json({
                error: req.aiError,
                message: "AI generation failed. Please provide a valid API key in the settings panel."
            });
        }

        // Only use local fallback if AI truly failed (not as primary)
        console.warn(`[AI Core] ⚠️  All AI providers failed or no key provided. Using local fallback...`);
        const extractedRole = targetRole || "Systems Architect";
        const match = getLocalMatch(extractedRole);
        req.aiGeneratedPayload = {
            summary: match.data.summary,
            experience: {
                company: match.data.company,
                role: match.data.role,
                bullets: match.data.bullets
            },
            skills: match.data.skills,
            education: {
                institution: "Shri Ramswaroop Memorial University",
                degree: match.data.degree
            },
            certifications: {
                title: match.data.certifications,
                provider: match.data.provider
            }
        };
        return next();
    }

    // Standard Prompt Role request flow
    if (useGemini) {
        const modelHint = getGeminiModelCandidates()[0] || GEMINI_MODEL_DEFAULT;
        console.log(`[AI Core] Directing draft request to Gemini Model (${modelHint})...`);
        try {
            const result = await callGemini(geminiKey, systemPrompt, userPrompt);
            req.aiGeneratedPayload = result;
            req.aiUsedRealProvider = true;
            return next();
        } catch (err) {
            console.warn("[AI Core] Gemini failed, attempting local fallback...");
        }
    } else if (useOpenAI) {
        console.log(`[AI Core] Directing draft request to OpenAI Model (${OPENAI_MODEL})...`);
        try {
            const result = await callOpenAI(openaiKey, systemPrompt, userPrompt);
            req.aiGeneratedPayload = result;
            req.aiUsedRealProvider = true;
            return next();
        } catch (err) {
            console.warn("[AI Core] OpenAI failed, attempting local fallback...");
        }
    }

    // Dynamic offline semantic engine fallback
    console.log(`[AI Core] Running dynamic offline semantic adapter for target role: "${targetRole}"`);
    const match = getLocalMatch(targetRole);
    
    // Dynamically inject custom role/company inputs into the matching fallback data
    const finalPayload = {
        summary: match.data.summary.replace(/Lead Systems Developer/g, targetRole).replace(/Vortex Tech Solutions/g, company || "Nexus Enterprises"),
        experience: {
            company: company || match.data.company,
            role: match.data.role.replace(/Systems Developer/g, targetRole),
            bullets: match.data.bullets
        },
        skills: match.data.skills,
        education: {
            institution: match.data.institution || "Shri Ramswaroop Memorial University",
            degree: match.data.degree || "Master of Computer Applications (MCA)"
        },
        certifications: {
            title: match.data.certifications,
            provider: match.data.provider
        }
    };

    req.aiGeneratedPayload = finalPayload;
    next();
};

// ATS Suggestion Handler
const generateATSKeywords = async (req, res) => {
    const { targetRole } = req.body;
    
    if (!targetRole) {
        return res.status(400).json({ error: "Missing payload parameter: targetRole" });
    }

    const geminiKey = getApiKey(req.headers['x-gemini-key'], process.env.GEMINI_API_KEY, "your_gemini_api_key_here");
    const openaiKey = getApiKey(req.headers['x-openai-key'], process.env.OPENAI_API_KEY, "your_openai_api_key_here");

    const useGemini = !!geminiKey;
    const useOpenAI = !!openaiKey;

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

    if (useGemini) {
        const modelHint = getGeminiModelCandidates()[0] || GEMINI_MODEL_DEFAULT;
        console.log(`[AI Core] Directing ATS request to Gemini Model (${modelHint})...`);
        try {
            const result = await callGemini(geminiKey, systemPrompt, userPrompt);
            return res.status(200).json({ success: true, keywords: result.keywords });
        } catch (err) {
            console.warn("[AI Core] Gemini ATS failed, attempting local fallback...");
        }
    } else if (useOpenAI) {
        console.log(`[AI Core] Directing ATS request to OpenAI Model (${OPENAI_MODEL})...`);
        try {
            const result = await callOpenAI(openaiKey, systemPrompt, userPrompt);
            return res.status(200).json({ success: true, keywords: result.keywords });
        } catch (err) {
            console.warn("[AI Core] OpenAI ATS failed, attempting local fallback...");
        }
    }

    // Dynamic offline semantic engine fallback for ATS
    console.log(`[AI Core] Running dynamic offline ATS keyword adapter for target role: "${targetRole}"`);
    const match = getLocalMatch(targetRole);
    return res.status(200).json({ success: true, keywords: match.keywords });
};

// ATS Scorer Engine Handler
const checkATSScore = async (req, res) => {
    const { targetRole, resumeData } = req.body;
    
    if (!targetRole || !resumeData) {
        return res.status(400).json({ error: "Missing parameters: targetRole and resumeData are required" });
    }

    const geminiKey = getApiKey(req.headers['x-gemini-key'], process.env.GEMINI_API_KEY, "your_gemini_api_key_here");
    const openaiKey = getApiKey(req.headers['x-openai-key'], process.env.OPENAI_API_KEY, "your_openai_api_key_here");

    const useGemini = !!geminiKey;
    const useOpenAI = !!openaiKey;

    const systemPrompt = `You are a premium applicant tracking system (ATS) optimization engine.
Analyze the provided resume contents against the target career role and calculate a compatibility percentage score (0-100).
Produce a strict valid JSON object containing exactly the following schema:
{
    "score": 85,
    "highlights": [
        "Include a bulleted list of 3-5 specific recommendations, missing keywords, and layout optimizations"
    ]
}`;

    const userPrompt = `Target Role: "${targetRole}"
Resume Data:
${JSON.stringify(resumeData, null, 2)}`;

    if (useGemini) {
        console.log(`[AI Core] Directing ATS Scorer to Gemini Model...`);
        try {
            const result = await callGemini(geminiKey, systemPrompt, userPrompt);
            return res.status(200).json({ success: true, score: result.score, highlights: result.highlights });
        } catch (err) {
            console.warn("[AI Core] Gemini Scorer failed, attempting local fallback...");
        }
    } else if (useOpenAI) {
        console.log(`[AI Core] Directing ATS Scorer to OpenAI Model...`);
        try {
            const result = await callOpenAI(openaiKey, systemPrompt, userPrompt);
            return res.status(200).json({ success: true, score: result.score, highlights: result.highlights });
        } catch (err) {
            console.warn("[AI Core] OpenAI Scorer failed, attempting local fallback...");
        }
    }

    // Dynamic Local Scorer Fallback
    console.log(`[AI Core] Running offline local ATS Score calculation for role: "${targetRole}"`);
    const match = getLocalMatch(targetRole);
    
    // Concatenate all resume text for scoring
    const fullText = (
        (resumeData.fullName || "") + " " +
        (resumeData.targetRole || "") + " " +
        (resumeData.contactLine || "") + " " +
        (resumeData.summary || "") + " " +
        (resumeData.blocks || []).map(b => (b.val1 || "") + " " + (b.val2 || "") + " " + (b.bullets || "")).join(" ")
    ).toLowerCase();

    // Check matching keywords in text
    let matchedKeywords = [];
    let missingKeywords = [];
    
    match.keywords.forEach(kw => {
        if (fullText.includes(kw.term.toLowerCase())) {
            matchedKeywords.push(kw.term);
        } else {
            missingKeywords.push(kw.term);
        }
    });

    // Score components
    let keywordScore = Math.round((matchedKeywords.length / Math.max(1, match.keywords.length)) * 60); // Max 60%
    let structuralScore = 0; // Max 40%

    let highlights = [];

    // Structural checks
    if (resumeData.email && resumeData.email.includes("@")) {
        structuralScore += 10;
    } else {
        highlights.push("❌ Contact Information: Add a valid email address so recruiters can contact you.");
    }

    if (resumeData.phone && resumeData.phone.trim().length > 5) {
        structuralScore += 10;
    } else {
        highlights.push("❌ Contact Information: Provide a professional phone number contact field.");
    }

    if (resumeData.location && resumeData.location.trim().length > 3) {
        structuralScore += 10;
    } else {
        highlights.push("⚠️ Contact Information: Specify your city/location state for local filtering.");
    }

    const summaryText = (resumeData.summary || "").trim();
    if (summaryText.length >= 40) {
        structuralScore += 10;
    } else {
        highlights.push("⚠️ Professional Summary: Write a detailed summary section with at least 40 characters.");
    }

    // Keyword highlights
    if (missingKeywords.length > 0) {
        highlights.push(`💡 Missing Key Terms: Recruiters search for "${missingKeywords.slice(0, 3).join(", ")}". Try to incorporate them.`);
    } else {
        highlights.push("🎉 Outstanding Keyword Density! All premium matching keywords exist in your resume.");
    }

    // Check template format compatibility
    if (resumeData.templateFramework && resumeData.templateFramework.includes("ats")) {
        highlights.push("✔ Format: Strict ATS single-column template is active. Parsing compatibility maximized.");
    } else {
        highlights.push("💡 Format: Consider switching to an 'ATS-Friendly' template (e.g. ATS Clean) for 100% scanning accuracy.");
    }

    const finalScore = Math.min(100, keywordScore + structuralScore);

    return res.status(200).json({
        success: true,
        score: finalScore,
        highlights: highlights
    });
};

const generatePortfolioData = async (req, res, next) => {
    try {
        const { targetRole, resumeId, resumeData, resumeImage } = req.body;
        
        let finalRole = targetRole || "Software Engineer";
        let fullName = "Alex Rivera";
        let email = "alex.rivera@dev.io";
        let phone = "+1 (555) 234-5678";
        let location = "San Francisco, CA";
        let summaryText = "";
        let extractedSkills = [];
        let extractedExp = [];
        let extractedProj = [];

        // If we have a resumeId, try to retrieve it to seed data
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
                    
                    // Parse blocks
                    if (resumeObj.blocksData && resumeObj.blocksData.length > 0) {
                        resumeObj.blocksData.forEach(block => {
                            if (block.blockType === 'summary') {
                                summaryText = block.val1;
                            } else if (block.blockType === 'skills') {
                                extractedSkills.push(block.val1 || block.bullets);
                            } else if (block.blockType === 'experience') {
                                extractedExp.push({
                                    role: block.val1,
                                    company: block.val2,
                                    duration: block.bullets ? block.bullets.split('\n')[0] : "2023 - Present",
                                    description: block.bullets || ""
                                });
                            } else if (block.blockType === 'project') {
                                extractedProj.push({
                                    title: block.val1,
                                    description: block.val2 || "",
                                    tags: block.bullets || "",
                                    githubLink: "#",
                                    liveLink: "#"
                                });
                            }
                        });
                    }
                }
            } catch (err) {
                console.warn("[AI Portfolio] Error loading resume to seed:", err.message);
            }
        } else if (resumeData) {
            // Seed from direct resumeData object passed from workspace
            fullName = resumeData.fullName || fullName;
            finalRole = resumeData.targetRole || finalRole;
            email = resumeData.email || email;
            phone = resumeData.phone || phone;
            location = resumeData.location || location;
            summaryText = resumeData.summary || summaryText;
            
            if (resumeData.blocks && resumeData.blocks.length > 0) {
                resumeData.blocks.forEach(block => {
                    if (block.blockType === 'skills' || block.type === 'skills') {
                        extractedSkills.push(block.val1 || block.bullets);
                    } else if (block.blockType === 'experience' || block.type === 'experience') {
                        extractedExp.push({
                            role: block.val1,
                            company: block.val2,
                            duration: block.bullets ? block.bullets.split('\n')[0] : "2023 - Present",
                            description: block.bullets || ""
                        });
                    } else if (block.blockType === 'project' || block.type === 'project') {
                        extractedProj.push({
                            title: block.val1,
                            description: block.val2 || "",
                            tags: block.bullets || "",
                            githubLink: "#",
                            liveLink: "#"
                        });
                    }
                });
            }
        }

        const geminiKey = getApiKey(req.headers['x-gemini-key'], process.env.GEMINI_API_KEY, "your_gemini_api_key_here");
        const openaiKey = getApiKey(req.headers['x-openai-key'], process.env.OPENAI_API_KEY, "your_openai_api_key_here");

        const useGemini = !!geminiKey;
        const useOpenAI = !!openaiKey;

        const systemPrompt = `You are a premium Portfolio Synthesis AI engine.
Your task is to convert professional resume contents into an outstanding, creative, and production-ready portfolio database config JSON.
You MUST respond with a strict, valid JSON object containing exactly the following schema:
{
    "fullName": "Full Name",
    "targetRole": "Professional Title / Role",
    "bio": "A punchy, professional, and exciting profile introduction bio (approx 2-3 sentences).",
    "contact": {
        "email": "Email address",
        "phone": "Phone number",
        "github": "Github link (fictional or real)",
        "linkedin": "Linkedin link (fictional or real)",
        "twitter": "Twitter link (fictional or real)"
    },
    "skills": [
        { "category": "Category Name (e.g. Frontend, Databases)", "items": "React, Tailwind, HTML5, JavaScript (comma-separated)" }
    ],
    "projects": [
        {
            "title": "Exciting Project Title",
            "description": "Engaging project description showing impact and visual complexity.",
            "tags": "React, Node.js, Express (comma-separated tech stack tags)",
            "githubLink": "GitHub URL placeholder",
            "liveLink": "Live preview URL placeholder"
        }
    ],
    "experience": [
        {
            "role": "Job Role",
            "company": "Company Name",
            "duration": "Duration (e.g. 2023 - Present)",
            "description": "A clean summarized highlight of the role experience."
        }
    ]
}
Provide exactly 2-3 grouped skills categories, 2-3 highly detailed projects tailored to the user's background, and 1-2 experiences. Make it look premium!`;

        let userPrompt = `Synthesize a premium portfolio config JSON for:
Full Name: "${fullName}"
Target Career Role: "${finalRole}"
Contact: Email "${email}", Phone "${phone}", Location "${location}"
Summary Context: "${summaryText || "Excellent professional with expertise in " + finalRole}"`;

        if (extractedSkills.length > 0) userPrompt += `\nSkills Context: ${extractedSkills.join(', ')}`;
        if (extractedExp.length > 0) userPrompt += `\nExperiences Context: ${JSON.stringify(extractedExp)}`;
        if (extractedProj.length > 0) userPrompt += `\nProjects Context: ${JSON.stringify(extractedProj)}`;

        if (resumeImage) {
            userPrompt += `\n[Resume File OCR request]: Parse the attached document (image/PDF base64) to extract and reconstruct this portfolio structure.`;
        }

        // 1. Gemini AI generation flow
        if (useGemini) {
            console.log(`[AI Portfolio] Directing portfolio compilation request to Gemini...`);
            try {
                let result;
                if (resumeImage) {
                    const base64Data = resumeImage.split(",")[1] || resumeImage;
                    const mimeType = resumeImage.match(/data:([^;]+);/)?.[1] || "image/jpeg";
                    result = await callGeminiMultimodal(geminiKey, systemPrompt, userPrompt, base64Data, mimeType);
                } else {
                    result = await callGemini(geminiKey, systemPrompt, userPrompt);
                }
                req.aiGeneratedPortfolio = result;
                return next();
            } catch (err) {
                console.warn("[AI Portfolio] Gemini generation failed, trying fallback...", err.message);
            }
        } 
        // 2. OpenAI AI generation flow
        else if (useOpenAI) {
            console.log(`[AI Portfolio] Directing portfolio compilation request to OpenAI...`);
            try {
                let result;
                if (resumeImage && !resumeImage.includes("application/pdf")) {
                    result = await callOpenAIMultimodal(openaiKey, systemPrompt, userPrompt, resumeImage);
                } else {
                    result = await callOpenAI(openaiKey, systemPrompt, userPrompt);
                }
                req.aiGeneratedPortfolio = result;
                return next();
            } catch (err) {
                console.warn("[AI Portfolio] OpenAI generation failed, trying fallback...", err.message);
            }
        }

        // 3. Elegant offline semantic generator fallback
        console.log(`[AI Portfolio] Running offline local portfolio synthesis adapter for target: "${finalRole}"`);
        
        // Find best match in semantic DB to populate
        const roleLower = finalRole.toLowerCase();
        let matchCategory = "developer";
        let defaultBio = `Innovative and result-oriented Professional specializing in ${finalRole} frameworks. Dedicated to building reliable systems, maximizing workflow throughputs, and standardizing quality benchmarks.`;
        
        if (roleLower.includes("dev") || roleLower.includes("engine") || roleLower.includes("coder") || roleLower.includes("program")) {
            matchCategory = "developer";
            defaultBio = "Innovative Full Stack Developer dedicated to engineering secure, scalable web systems and low-latency API architectures. Expert in building optimized responsive layouts and microservice nodes.";
        } else if (roleLower.includes("design") || roleLower.includes("ux") || roleLower.includes("ui") || roleLower.includes("art")) {
            matchCategory = "designer";
            defaultBio = "Creative UI/UX Designer dedicated to sculpting premium, user-centered digital ecosystems and fluid design tokens. Skilled in interactive wireframing, high-fidelity spatial models, and layouts.";
        } else if (roleLower.includes("data") || roleLower.includes("science") || roleLower.includes("analyt")) {
            matchCategory = "data";
            defaultBio = "Analytical Data Scientist with a passion for designing predictive statistical models, orchestrating clean database architectures, and deploying highly automated ETL pipelines.";
        } else if (roleLower.includes("finance") || roleLower.includes("invest") || roleLower.includes("bank")) {
            matchCategory = "finance";
            defaultBio = "Detail-oriented Financial Analyst experienced in launching mathematical risk assessments, auditing capital budgets, and scaling automated dashboard systems.";
        } else if (roleLower.includes("market") || roleLower.includes("seo") || roleLower.includes("growth")) {
            matchCategory = "marketing";
            defaultBio = "Dynamic Marketing Growth Strategist specialized in scaling performance marketing acquisitions, SEO architectures, and automated retention funnels.";
        } else if (roleLower.includes("manag") || roleLower.includes("scrum") || roleLower.includes("product")) {
            matchCategory = "manager";
            defaultBio = "Strategic Project Manager adept at executing complex, multi-phase technical roadmaps using modern Agile methodologies to deliver releases on schedule.";
        }

        // Prepare local portfolio profiles
        const LOCAL_PROFILES = {
            developer: {
                fullName: fullName,
                targetRole: finalRole || "Lead Systems Developer",
                bio: summaryText || defaultBio,
                contact: {
                    email: email,
                    phone: phone,
                    github: "https://github.com/developer-sandbox",
                    linkedin: "https://linkedin.com/in/developer-sandbox",
                    twitter: "https://twitter.com/dev_sandbox"
                },
                skills: [
                    { category: "Languages & Frameworks", items: extractedSkills.length > 0 ? extractedSkills.join(', ') : "React, Node.js, Express, MongoDB, TypeScript, Tailwind CSS, JavaScript" },
                    { category: "Systems & Cloud Infrastructure", items: "AWS S3, Docker, Git Version Control, REST API Architectures, CI/CD" }
                ],
                projects: extractedProj.length > 0 ? extractedProj : [
                    {
                        title: "Vortex Real-time Analytics Console",
                        description: "Engineered a lightning-fast performance dashboard mapping transaction latency graphs. Optimized indices to accelerate visual paint times by 32%.",
                        tags: "React, Node.js, Express, WebSockets",
                        githubLink: "https://github.com/developer-sandbox/vortex-analytics",
                        liveLink: "https://vortex-analytics-sandbox.io"
                    },
                    {
                        title: "Aether Glassmorphic UI Suite",
                        description: "Crafted an interactive modular frontend system utilizing clean backdrop blurs, floating accent panels, and smooth micro-transitions.",
                        tags: "Next.js, Tailwind CSS, Vanilla JS",
                        githubLink: "https://github.com/developer-sandbox/aether-ui",
                        liveLink: "https://aether-ui-sandbox.io"
                    }
                ],
                experience: extractedExp.length > 0 ? extractedExp : [
                    {
                        role: "Lead Systems Architect",
                        company: "Vortex Tech Solutions",
                        duration: "2024 - Present",
                        description: "Architected modern microservices, optimized indexing schemas, and guided team engineers to ship scalable features."
                    }
                ]
            },
            designer: {
                fullName: fullName,
                targetRole: finalRole || "Senior UI/UX Designer",
                bio: summaryText || defaultBio,
                contact: {
                    email: email,
                    phone: phone,
                    github: "https://behance.net/designer-sandbox",
                    linkedin: "https://linkedin.com/in/designer-sandbox",
                    twitter: "https://dribbble.com/designer_sandbox"
                },
                skills: [
                    { category: "Creative & Visual Design", items: extractedSkills.length > 0 ? extractedSkills.join(', ') : "Figma, Adobe Creative Suite, Design Systems, High-Fidelity Prototyping, Wireframing" },
                    { category: "Frontend Integration", items: "CSS Grid, Tailwind CSS Tokens, Responsive Layouts, SVG Animation" }
                ],
                projects: extractedProj.length > 0 ? extractedProj : [
                    {
                        title: "Aether Glass design Ecosystem",
                        description: "Curated a responsive glassmorphic UI kit. Conducted layout review cycles to lift user engagement percentages by 26%.",
                        tags: "Figma, Prototyping, Design Systems",
                        githubLink: "https://behance.net/designer-sandbox/aether-glass",
                        liveLink: "https://aether-design-system.io"
                    }
                ],
                experience: extractedExp.length > 0 ? extractedExp : [
                    {
                        role: "Senior Visual Designer",
                        company: "Prism Creative Studios",
                        duration: "2023 - Present",
                        description: "Spearheaded design token deployments and reduced visual engineering transition times by 35%."
                    }
                ]
            }
        };

        // Select profile based on category or fall back to developer structure
        const finalPortfolio = LOCAL_PROFILES[matchCategory] || LOCAL_PROFILES.developer;
        
        // Final fallback sanitizations for custom roles (finance, manager, etc.)
        if (matchCategory !== "developer" && matchCategory !== "designer") {
            finalPortfolio.targetRole = finalRole;
            finalPortfolio.bio = summaryText || defaultBio;
            finalPortfolio.skills = [
                { category: "Core Specialization & Frameworks", items: extractedSkills.length > 0 ? extractedSkills.join(', ') : "Strategic Operations, Analysis, System Tools, Management Matrices" },
                { category: "Workflow Technologies", items: "Jira, Agile Methodologies, Resource Allocation, Budget Tracking" }
            ];
            finalPortfolio.projects = extractedProj.length > 0 ? extractedProj : [
                {
                    title: `Apex ${finalRole} Operations Console`,
                    description: `Launched a highly automated pipeline tracking tool for ${finalRole} processes, driving Quarterly yield averages.`,
                    tags: `${finalRole}, Process Optimization, Performance Analytics`,
                    githubLink: "#",
                    liveLink: "#"
                }
            ];
            finalPortfolio.experience = extractedExp.length > 0 ? extractedExp : [
                {
                    role: `Lead ${finalRole}`,
                    company: "Apex Enterprise Systems",
                    duration: "2023 - Present",
                    description: `Coordinated cross-functional divisions, managing operational budgets and accelerating structural deliverables.`
                }
            ];
        }

        req.aiGeneratedPortfolio = finalPortfolio;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { simulateAIExtension, generateATSKeywords, checkATSScore, generatePortfolioData };
