import { z } from 'zod'

export const loginSchema = z.object({
    login: z.string()
        .min(1, 'Поле обязательно для заполнения')
        .refine((val) => {
            if (val.includes('@')) {
                return z.string().email().safeParse(val).success
            }
            return val.length >= 3
        }, {
            message: 'Введите корректный email или логин (минимум 3 символа)'
        }),
    password: z.string()
        .min(6, 'Пароль должен содержать минимум 6 символов')
        .max(100, 'Пароль слишком длинный')
})

export const registerSchema = z.object({
    username: z.string().min(2, 'Логин должен содержать минимум 2 символа'),
    email: z.string().email('Некорректный email'),
    password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ["confirmPassword"]
})

export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>