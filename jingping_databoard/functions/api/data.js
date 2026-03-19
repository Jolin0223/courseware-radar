export async function onRequestGet(context) {
    const { env } = context;
    
    // 从 Cloudflare 的加密环境变量中读取账号密码
    const SUPABASE_URL = env.SUPABASE_URL; 
    const SUPABASE_KEY = env.SUPABASE_KEY;

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/courseware_jingpingdata?select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        if (!res.ok) {
            throw new Error(`数据库请求失败: ${res.status}`);
        }

        const data = await res.json();
        return Response.json({ status: "success", data: data });

    } catch (error) {
        return Response.json({ status: "error", message: error.message });
    }
}