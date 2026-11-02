import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import books from './books.js';
import authors from './authors.js';
import submissions from './submissions.js';
import misc from './misc.js';

const router = Router();

router.use(requireAuth);
router.use('/books', books);
router.use('/authors', authors);
router.use('/submissions', submissions);
router.use('/', misc);

export default router;
