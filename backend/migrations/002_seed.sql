-- AI Junior Developer — Seed Data
-- Inserts a demo user and sample project for testing
-- Password for demo user: demo1234

INSERT INTO users (id, name, email, password_hash) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Alex Chen',
  'demo@devassist.ai',
  '$2b$10$rQ5sj5XH3RbH2DJZ3eRYG.SFN6T4HVxJjvIIVX7bIWCxpzBkv1cw6'  -- bcrypt of 'demo1234'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO projects (id, user_id, name, description, primary_language) VALUES (
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'e-commerce-api',
  'REST API for product catalog and checkout flows',
  'TypeScript'
) ON CONFLICT DO NOTHING;

INSERT INTO project_files (id, project_id, file_name, file_path, language, content) VALUES (
  'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'productController.ts',
  '/src/controllers',
  'TypeScript',
$$import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  categoryId: z.string().uuid()
});

export class ProductController {
  constructor(private productService: ProductService) {}

  async getAll(req: Request, res: Response) {
    const { page = 1, limit = 20, category } = req.query;
    const products = await this.productService.findAll({
      page: Number(page),
      limit: Number(limit),
      category: category as string
    });
    res.json({ success: true, data: products });
  }

  async create(req: Request, res: Response) {
    const body = productSchema.parse(req.body);
    const product = await this.productService.create(body);
    res.status(201).json({ success: true, data: product });
  }

  async getById(req: Request, res: Response) {
    const product = await this.productService.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, data: product });
  }
}$$
) ON CONFLICT DO NOTHING;
