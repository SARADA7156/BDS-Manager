export interface Payload {
    userId: number;
    userName: string;
    permission: "admin" | "operator" | "member";
}