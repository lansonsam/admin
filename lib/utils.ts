import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generatePassword(length: number = 12): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";

  // 确保密码包含至少一个大写字母、一个小写字母、一个数字和一个特殊字符
  password += charset.match(/[A-Z]/)?.[0] || 'A';
  password += charset.match(/[a-z]/)?.[0] || 'a';
  password += charset.match(/[0-9]/)?.[0] || '1';
  password += charset.match(/[!@#$%^&*]/)?.[0] || '!';

  // 生成剩余的随机字符
  for (let i = password.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  // 打乱密码字符顺序
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
