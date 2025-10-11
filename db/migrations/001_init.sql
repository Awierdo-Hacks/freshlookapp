CREATE TABLE Styles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);
CREATE TABLE Outfits (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100),
  style_id INT REFERENCES Styles(id),
  price DECIMAL(8,2),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE OutfitAttributes (
  id SERIAL PRIMARY KEY,
  outfit_id INT REFERENCES Outfits(id),
  attr_name VARCHAR(50),
  attr_value VARCHAR(100)
);
