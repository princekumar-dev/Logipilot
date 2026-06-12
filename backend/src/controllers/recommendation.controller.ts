import { Request, Response } from 'express';
import { getAiRecommendationModel } from '../models/AiRecommendation';

export const getAllRecommendations = async (req: Request, res: Response) => {
  try {
    const AiRecommendation = await getAiRecommendationModel();
    const { page = 1, limit = 20, status, priority } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const recommendations = await AiRecommendation.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ generatedAt: -1 });

    const total = await AiRecommendation.countDocuments(query);

    res.json({
      success: true,
      message: 'Recommendations retrieved successfully',
      data: { recommendations, total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error: any) {
    console.error('Error fetching recommendations:', error.message);
    res.json({
      success: true,
      message: 'No database connected',
      data: { recommendations: [], total: 0, page: 1, pages: 0 }
    });
  }
};
