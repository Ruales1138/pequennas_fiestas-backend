import { Router } from "express";
import { PrismaUserRepository } from "../../infrastructure/repository/prisma-user.repository.js";
import { RegisterUserUseCase } from "../../application/use-cases/auth/register-user.use-case.js";
import { LoginUserUseCase } from "../../application/use-cases/auth/login-user.use-case.js";
import { AuthController } from "../controllers/auth.controller.js";

const userRepo = new PrismaUserRepository();
const registerUserUseCase = new RegisterUserUseCase(userRepo);
const loginUserUseCase = new LoginUserUseCase(userRepo);
const controller = new AuthController(registerUserUseCase, loginUserUseCase, userRepo);

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario (cliente/artista/user) con bcrypt y retornar JWT
 * @access  Público
 */
router.post("/register", controller.register);
router.post("/sign-up/email", controller.register);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión validando contraseña con bcrypt y retornar JWT
 * @access  Público
 */
router.post("/login", controller.login);
router.post("/sign-in/email", controller.login);

/**
 * @route   GET /api/auth/get-session | GET /api/auth/me
 * @desc    Obtener sesión activa a partir del token JWT Bearer
 * @access  Protegido
 */
router.get("/get-session", controller.getSession);
router.get("/me", controller.getSession);

/**
 * @route   POST /api/auth/sign-out | POST /api/auth/logout
 * @desc    Cerrar sesión
 * @access  Público
 */
router.post("/sign-out", controller.logout);
router.post("/logout", controller.logout);

/**
 * @route   POST /api/auth/update-user
 * @desc    Actualizar imagen o nombre del usuario autenticado
 * @access  Protegido
 */
router.post("/update-user", controller.updateUser);

export { router as authRouter };
