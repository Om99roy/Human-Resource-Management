import dotenv from "dotenv";
import pino from "pino";
import app from "./app";

dotenv.config();

const logger = pino();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  logger.info(`Auth Service running on port ${PORT}`);
});
