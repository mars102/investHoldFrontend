import { z } from 'zod'

export const loginSchema = z.object({
    email: z.string()
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
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
})

export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>