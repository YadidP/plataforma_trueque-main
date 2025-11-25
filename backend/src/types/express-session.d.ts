import 'express-session';

declare module 'express-session' {
    interface SessionData {
        userId?: number;
        user?: {
            id: number;
            name: string;
            email: string;
            role: string;
        };
    }
}

declare module 'express' {
    interface Request {
        session: Session & Partial<SessionData>;
    }
}
