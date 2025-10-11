const request = require('supertest');
const { app } = require('../server');

describe('API Endpoints', () => {
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });

  describe('GET /api/styles', () => {
    it('should return styles array', async () => {
      const res = await request(app).get('/api/styles');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/outfits', () => {
    it('should return paged outfits', async () => {
      const res = await request(app).get('/api/outfits?page=1&limit=10');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
    });

    it('should filter by style', async () => {
      const res = await request(app).get('/api/outfits?style=Old%20money');
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });

    it('should filter by price range', async () => {
      const res = await request(app).get('/api/outfits?minPrice=100&maxPrice=200');
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('POST /api/outfits', () => {
    it('should create new outfit', async () => {
      const newOutfit = {
        title: 'Test Outfit',
        style_id: 1,
        price: 99.99,
        image_url: 'https://example.com/image.jpg'
      };

      const res = await request(app)
        .post('/api/outfits')
        .send(newOutfit);
      
      expect(res.status).toBe(201);
      expect(res.body.title).toBe(newOutfit.title);
    });
  });
});
