// Rotas admin fecham com segurança quando JWT_SECRET está ausente. A suíte
// exercita essas rotas diretamente (sem o runtime que injeta env), portanto
// usa uma chave exclusivamente de teste, forte o bastante para o mesmo
// contrato de produção e sem qualquer relação com credenciais reais.
process.env.JWT_SECRET ||= 'jwt-secret-exclusivo-da-suite-de-testes-2026'
