import TelegramStore from '../models/telegram_store.models.js';
import { validateTelegramLink } from '../utils/validators.utils.js';

export const createLink = async (req, res) => {
  try {
    const { error } = validateTelegramLink(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Check at least one relationship exists
    if (!req.body.courseId && !req.body.classId && !req.body.academicId && !req.body.departmentId) {
      return res.status(400).json({ error: 'Link must belong to at least one entity' });
    }

    const newLink = await TelegramStore.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json(newLink);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Telegram link already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

export const getLinks = async (req, res) => {
  try {
    const filters = {
      courseId: req.query.courseId,
      classId: req.query.classId,
      academicId: req.query.academicId,
      departmentId: req.query.departmentId,
      isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
      linkType: req.query.linkType
    };

    const links = await TelegramStore.getAll(filters);
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLinkById = async (req, res) => {
  try {
    const link = await TelegramStore.getById(req.params.id);
    if (!link) return res.status(404).json({ error: 'Telegram link not found' });
    res.json(link);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateLink = async (req, res) => {
  try {
    const { error } = validateTelegramLink(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const updatedLink = await TelegramStore.update(req.params.id, {
      ...req.body,
      updatedBy: req.user.id
    });

    if (!updatedLink) return res.status(404).json({ error: 'Telegram link not found' });
    res.json(updatedLink);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Telegram link already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

export const deactivateLink = async (req, res) => {
  try {
    const link = await TelegramStore.deactivate(req.params.id, req.user.id);
    if (!link) return res.status(404).json({ error: 'Telegram link not found' });
    res.json({ message: 'Link deactivated successfully', link });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteLink = async (req, res) => {
  try {
    const success = await TelegramStore.delete(req.params.id);
    if (!success) return res.status(404).json({ error: 'Telegram link not found' });
    res.json({ message: 'Link deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};