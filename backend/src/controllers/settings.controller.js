const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getSettings = async (req, res, next) => {
  try {
    const settings = await prisma.platformSettings.findMany();
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    res.json({ success: true, data: { settings: map } });
  } catch (err) { next(err); }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const updates = req.body;
    const ops = Object.entries(updates).map(([key, value]) =>
      prisma.platformSettings.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value) } })
    );
    await Promise.all(ops);
    res.json({ success: true, message: 'Settings updated.' });
  } catch (err) { next(err); }
};
