import { z } from 'zod';
export const consultantInput = z.object({name:z.string().trim().min(2).max(80),businessCode:z.string().trim().max(40).optional(),phone:z.string().trim().max(30).optional(),status:z.enum(['ACTIVE','NEW','PAUSED','INACTIVE']),note:z.string().trim().max(500).optional()}).strict();
export const orderInput = z.object({consultantId:z.string().min(1),weekId:z.string().min(1),source:z.enum(['AUDIO','PHOTO','TEXT','OTHER']),summary:z.string().trim().min(1).max(500),amount:z.number().nonnegative().optional()}).strict();
