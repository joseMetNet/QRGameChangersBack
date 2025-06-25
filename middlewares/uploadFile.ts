import multer from 'multer';
const storage = multer.memoryStorage();

export const upload = multer({ storage });

export const parseTextFields = (req: { body: any; }, res: any, next: () => void) => {
  const body = req.body;

  for (const key in body) {
    try {
      body[key] = JSON.parse(body[key]);
    } catch (e) {
    }
  }

  next();
};
