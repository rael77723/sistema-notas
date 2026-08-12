export default async function handler(req, res) {
    // Cabeçalhos essenciais para liberar o CORS no front-end do seu site
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Resposta rápida para a verificação de segurança do navegador
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Puxa a chave que você cadastrou lá no painel da Vercel
        const SIEG_API_KEY = process.env.SIEG_API_KEY;
        const { path, xmlKey } = req.query;

        // Monta a URL da SIEG embutindo a chave de forma oculta
        let targetUrl = `https://api.sieg.com/${path}?api_key=${SIEG_API_KEY}`;
        if (xmlKey) {
            targetUrl += `&xmlKey=${xmlKey}`;
        }

        const fetchOptions = {
            method: req.method,
            headers: { 'Content-Type': 'application/json' }
        };

        // Se houver Payload (como no caso do BaixarXmls), envia o corpo da requisição
        if (req.method === 'POST' && req.body) {
            fetchOptions.body = JSON.stringify(req.body);
        }

        // Faz o pedido oficial para a SIEG
        const response = await fetch(targetUrl, fetchOptions);
        const data = await response.json();

        // Devolve os dados para o seu index.html
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Falha na comunicação com a API SIEG.' });
    }
}
