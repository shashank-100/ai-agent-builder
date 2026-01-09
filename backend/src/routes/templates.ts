import { Router, Request, Response } from 'express';

const router = Router();

// List all templates
router.get('/', async (req: Request, res: Response) => {
  try {
    // TODO: Fetch from database
    res.json({
      templates: [
        {
          id: '1',
          name: 'LinkedIn Recruiter',
          description: 'Conducts candidate searches on LinkedIn',
          icon: '💼',
          category: 'recruitment',
        },
        {
          id: '2',
          name: 'Email Assistant',
          description: 'Organizes and manages your inbox',
          icon: '📧',
          category: 'productivity',
        },
        {
          id: '3',
          name: 'Daily Calendar Brief',
          description: 'Reviews your calendar and sends you a brief',
          icon: '📅',
          category: 'productivity',
        },
        {
          id: '4',
          name: 'Social Media AI Monitor',
          description: 'Daily AI/LLM content monitor with Slack digest',
          icon: '📱',
          category: 'monitoring',
        },
      ],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list templates' });
  }
});

// Get template by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // TODO: Fetch from database
    res.json({
      id,
      name: 'LinkedIn Recruiter',
      description: 'Conducts candidate searches on LinkedIn',
      config: {},
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get template' });
  }
});

// Create agent from template
router.post('/:id/create', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { workspaceId } = req.body;

    // TODO: Create agent from template
    res.status(201).json({
      agentId: 'mock-agent-id',
      templateId: id,
      message: 'Agent created from template',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create agent from template' });
  }
});

export default router;
