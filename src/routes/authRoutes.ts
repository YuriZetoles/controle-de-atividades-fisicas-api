// As rotas de autenticação do BetterAuth são gerenciadas automaticamente
// pelo handler montado em server.ts: app.all("/api/auth/*splat", toNodeHandler(auth))
//
// Endpoints disponíveis do BetterAuth (prefixo /api/auth):
//
//   POST /api/auth/sign-up/email    -> Cadastro com email/senha
//   POST /api/auth/sign-in/email    -> Login com email/senha
//   POST /api/auth/sign-out         -> Logout (invalida sessão)
//   GET  /api/auth/get-session      -> Retorna sessão atual do usuário
//
// No app Android, após o login, enviar o token nas requisições:
//   Authorization: Bearer <token_da_sessao>
//
// Este arquivo pode ser usado para rotas personalizadas de auth,
// como buscar perfil completo do aluno/treinador autenticado.

import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import UsuarioRepository from "../repositories/usuarioRepository";
import AlunoRepository from "../repositories/alunoRepository";
import TreinadorRepository from "../repositories/treinadorRepository";

const router = express.Router();

// Rota inteligente para obter o perfil completo do usuário logado
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const usuarioRepository = new UsuarioRepository();
    const perfilAcesso = await usuarioRepository.buscarPerfilAcesso(user.id);

    let dadosCompletos: any = null;

    if (perfilAcesso.isTreinador && perfilAcesso.treinadorId) {
      const treinadorRepo = new TreinadorRepository();
      dadosCompletos = await treinadorRepo.findById(perfilAcesso.treinadorId);
    } else if (perfilAcesso.isAluno && perfilAcesso.alunoId) {
      const alunoRepo = new AlunoRepository();
      dadosCompletos = await alunoRepo.findById(perfilAcesso.alunoId);
    }

    res.json({
      success: true,
      data: {
        ...user, // Dados básicos do Better Auth (id, name, email, image)
        tipo: perfilAcesso.isTreinador ? "treinador" : "aluno",
        isAdmin: perfilAcesso.isAdmin,
        perfil: dadosCompletos, // Dados específicos (peso, altura, CREF, etc)
      },
    });
  } catch (error) {
    console.error("[authRoutes] Erro na rota /me:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao carregar perfil" });
  }
});

export default router;
