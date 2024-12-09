import { User } from '@/types';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch users from the backend API
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${BASE_URL}/users`);
    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

// Handle adding a new user
export const handleAddUser = async (
  users: User[],
  formData: FormData
): Promise<User[]> => {
  const email = formData.get('email') as string;
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const phone = formData.get('phone') as string;

  const requestPayload = {
    email,
    username,
    password,
    phone,
  };

  try {
    const response = await fetch(`${BASE_URL}/adduser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    const data = await response.json();

    if (response.ok) {
      return [data, ...users];
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error adding user:', error);
    return users;
  }
};

// Handle adding or updating a user
export const handleUpdateUser = async (
  selectedUser: User | null,
  users: User[],
  formData: FormData
): Promise<User[]> => {
  const email = formData.get('email') as string;
  const username = formData.get('username') as string;
  const phone = formData.get('phone') as string;

  const requestPayload = {
    user_id: selectedUser?.user_id,
    email,
    username,
    phone,
  };

  try {
    const method = selectedUser ? 'PUT' : 'POST';

    const response = await fetch(`${BASE_URL}/updateuser`, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    const data = await response.json();

    if (response.ok) {
      if (selectedUser) {
        return users.map((user) => (user.id === selectedUser.id ? data : user));
      } else {
        return [data, ...users];
      }
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error updating user:', error);
    return users;
  }
};

// Handle deleting a user
export const handleDeleteUser = async (
  users: User[],
  selectedUser: User | null
): Promise<User[]> => {
  try {
    const response = await fetch(`${BASE_URL}/deleteuser`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: selectedUser?.user_id }),
    });

    const data = await response.json();

    if (response.ok) {
      return users.filter((user) => user.id !== selectedUser?.id);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return users;
  }
};
