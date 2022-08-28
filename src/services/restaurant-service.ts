import connection from "../config/db-connection";
import { v4 as createId } from "uuid";

const getRestaurants = (): Promise<Restaurant[]> => {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT id, name, brand_image as imageUrl, description FROM restaurants",
      (err, result: Restaurant[]) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

const getRestaurantsById = (id: string): Promise<Restaurant> => {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT id, name, brand_image as imageUrl, description FROM restaurants WHERE id = ?",
      [id],
      (err, result: Restaurant[]) => {
        if (err) return reject(err);
        if (result.length == 0)
          return reject({ message: `No restaurant with ${id} found` });
        resolve(result[0]);
      }
    );
  });
};

const createRestaurant = (
  name: string,
  description: string,
  imageUrl?: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const id = createId();
    connection.query(
      "INSERT INTO restaurants (id, name, brand_image, description) VALUES (?, ?, ?, ?)",
      [id, name, imageUrl, description],
      err => {
        if (err) return reject(err);
        resolve(id);
      }
    );
  });
};

const updateRestaurant = ({
  id,
  name,
  description,
  imageUrl,
}: Restaurant): Promise<void> => {
  return new Promise((resolve, reject) => {
    connection.query(
      "UPDATE restaurants SET name = ?, description = ?, imageUrl = ? WHERE id = ?",
      [name, description, imageUrl, id],
      err => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};

const deleteRestaurant = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    connection.query("DELETE FROM restaurants WHERE id = ?", [id], err => {
      if (err) return reject(err);
      resolve();
    });
  });
};

export {
  getRestaurants,
  getRestaurantsById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
};
