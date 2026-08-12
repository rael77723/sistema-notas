export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const SIEG_API_KEY = process.env.SIEG_API_KEY;
        
        // MODO DETETIVE: Se a Vercel não carregou a chave, ele avisa você na tela
        if (!SIEG_API_KEY) {
            return res.status(401).json({ 
                Message: "ERRO NA VERCEL: A variável SIEG_API_KEY está vazia ou não foi carregada no servidor." 
            });
        }

        const { path, xmlKey } = req.query;

        let targetUrl = `https://api.sieg.com/${path}?api_key=${SIEG_API_KEY}`;
        if (xmlKey) {
            targetUrl += `&xmlKey=${xmlKey}`;
        }

        const fetchOptions = {
            method: req.method,
            headers: { 'Content-Type': 'application/json' }
        };

        if (req.method === 'POST' && req.body) {
            fetchOptions.body = JSON.stringify(req.body);
        }

        const response = await fetch(targetUrl, fetchOptions);
        const data = await response.json();

        // MODO DETETIVE 2: Se a SIEG der erro, ele mostra a URL (escondendo parte da chave) para vermos o que foi enviado
        if (!response.ok) {
            const partialKey = SIEG_API_KEY.substring(0, 5) + '...';
            return res.status(response.status).json({
                Message: `Erro da SIEG (${response.status}): ${data.Message || data.error || 'Não autenticado'}`,
                TentouAcessar: `https://api.sieg.com/${path}?api_key=${partialKey}`
            });
        }

        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Falha na comunicação com a API SIEG interna.' });
    }
}
