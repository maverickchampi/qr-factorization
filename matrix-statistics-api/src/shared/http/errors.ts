import { messages } from "../values/messages.ts";

interface CustomErrorProps {
  message: string;
  status: number;
}

export class CustomError extends Error {
  public status: number;

  constructor({ message, status }: CustomErrorProps) {
    super(message);
    this.name = messages.error;
    this.status = status;
  }
}
