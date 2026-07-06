import Setting from '../models/settingModel.js';
import AuditLog from '../models/auditLogModel.js';

const getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create(req.body);
    } else {
      settings = await Setting.findByIdAndUpdate(settings._id, req.body, {
        returnDocument: 'after',
        runValidators: true,
      });
    }

    await AuditLog.create({
      user: req.user ? req.user.name : 'Admin',
      role: req.user ? req.user.role : 'Admin',
      action: 'UPDATE_SETTINGS',
      module: 'Settings',
      details: req.body,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const { module, search, page = 1, limit = 50 } = req.query;
    const query = {};
    if (module && module !== 'all') query.module = module;
    if (search) {
      query.$or = [
        { user: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

export { getSettings, updateSettings, getAuditLogs };
