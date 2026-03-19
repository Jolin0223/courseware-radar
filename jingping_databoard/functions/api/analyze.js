export async function onRequestPost(context) {
    const { request, env } = context;
    const reqData = await request.json();
    const { context: promptContext, type, metric_name, metric_val } = reqData;

    // 核心安全：API Key 从 Cloudflare 环境变量读取
    const LLM_API_URL = "http://menshen-code.test.xdf.cn/v1/chat/completions";
    const LLM_API_KEY = env.LLM_API_KEY; 
    const DEFAULT_MODEL = "xdf-gp-3.0";

    let sys_prompt, user_prompt;
    
    if (type === 'kpi') {
        sys_prompt = "你是一位顶尖的教育AI产品战略专家，专门协助小学素质教育与素养业务线的核心产品团队。你的任务是深度剖析竞品（飞象老师、好未来老师帮）的交互课件与数据生态，请用极其精炼、切中业务要害的一句话（绝对不超过 100 个字）解读该指标。不要废话，直接说出这个数据对新东方ITeach课件动画产品的指导意义";
        user_prompt = `指标：${metric_name}，当前值：${metric_val}。请一句话点评。`;
    } else {
        sys_prompt = `你是一位顶尖的教育AI产品战略专家。请严格按照以下极其死板的格式输出竞品数据分析（严禁改变括号和换行格式）：\n【竞品动作推测】：拒绝纯数据播报：不要重复数字，必须挖掘数据背后的业务逻辑（例如：高转化率说明了什么教师痛点？）(一句话总结，限100字以内)\n【迭代高优建议】：结合竞品数据，指出我们在研发自有AI互动资源平台时，应该优先切入哪些模板方向、避开哪些伪需求。(一句话总结，限100字以内)\n【生态差异打法】：指出竞品的薄弱点（如过度应试化、互动形式单一等），为我们的产品提供突围策略。(一句话总结，限100字以内)\n【详细分析】\n(此处输出不少于300字的详细Markdown深度研报，包含加粗、列表等排版)`;
        user_prompt = `【竞品最新数据切片】\n${promptContext}\n\n请按系统要求的格式输出研报。`;
    }

    const payload = {
        model: DEFAULT_MODEL,
        messages: [
            { role: "system", content: sys_prompt },
            { role: "user", content: user_prompt }
        ],
        temperature: 0.3
    };

    try {
        const response = await fetch(LLM_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${LLM_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API 调用失败: ${response.status}`);
        }

        const resJson = await response.json();
        const analysis = resJson.choices[0].message.content;
        return Response.json({ status: "success", analysis: analysis });

    } catch (error) {
        return Response.json({ status: "error", message: error.message });
    }
}