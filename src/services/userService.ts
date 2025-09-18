import Users, { IUsers } from "@/models/Users";

export async function saveUser(data: { contact: string, name?: string }): Promise<IUsers> {
   const user = new Users(data);
   return await user.save();
}

export async function UserExists(contact: string): Promise<boolean> {
   const user = await Users.findOne({ contact });
   return !!user;
}

export async function getUser({ contact }: { contact: string }): Promise<IUsers | null> {
   return await Users.findOne({ contact });
}