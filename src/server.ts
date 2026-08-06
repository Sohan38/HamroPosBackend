import app from './app';
import { env, validateConfig } from './config/env';
import { logger } from './config/logger';

if (env.nodeEnv === 'production') {
    validateConfig();
}

const port = env.port;

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});
