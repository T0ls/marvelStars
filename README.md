# MarvelStars - Digital Trading Card Game

![MarvelStars Banner](./assets/marvelBanner.webp)

**MarvelStars** is a full-stack web application designed for collecting, trading, and managing Marvel-themed digital cards. Users can register, earn currency, open mystery packs to discover heroes, and trade them on a global marketplace.

---

## Table of Contents
- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
  - [1. User Account System](#1-user-account-system)
  - [2. The Shop (Pack Opening)](#2-the-shop-pack-opening)
  - [3. Inventory Management](#3-inventory-management)
  - [4. The Marketplace](#4-the-marketplace)
- [Technical Architecture](#-technical-architecture)
- [API Documentation](#-api-documentation)
- [Installation & Setup](#-installation--setup)
- [Project Structure](#-project-structure)

---

## About the Project

MarvelStars brings the excitement of trading card games (TCG) to the web. It features a complete economy system where users manage "Hero Points," calculate card rarities, and interact with a dynamic market. Whether you are hunting for a **Legendary** card or trying to complete a full set of **Common** heroes, MarvelStars provides an immersive experience.

---

## Key Features

### 1. User Account System
A secure and robust authentication system allowing users to maintain their progress.
* **Registration & Login:** Secure entry to the platform (Logged vs. Unlogged views).
* **Profile Management:** Users can update their username, password, and profile picture.
* **Balance Management:** Simulate adding funds via a payment interface (Visa/Mastercard integration visuals).
* **Account Deletion:** Full control to delete user data and inventory.

### 2. The Shop (Pack Opening)
The core of the collection experience. Users spend *Hero Points* to buy packs with varying drop rates.
* **Pack Tiers:**
    * **Common Pack:** High chance for standard heroes.
    * **Epic Pack:** Better odds for rare characters.
    * **Legendary Pack:** The only way to guarantee high-tier loot.
* **Visual Effects:** Includes animations for pack opening (Still, Glow, Open states).

### 3. Inventory Management
A personal dashboard where users can view their collected cards.
* **Card Inspection:** View detailed statistics and artwork for every card owned.
* **Rarity System:** Cards are distinctively marked based on their rarity (Common, Epic, Legendary).
* **Collection Tracking:** Visual indicators of your current portfolio.

### 4. The Marketplace
A peer-to-peer trading platform.
* **Sell Cards:** Users can list unwanted or duplicate cards for sale at their chosen price.
* **Buy Cards:** Browse listings from other users to find missing pieces for your collection.
* **Real-time Transactions:** Updates user balances and inventories instantly upon purchase.

---

## Technical Architecture

**Frontend:**
* **HTML5 & CSS3:** Responsive design with specific styling for Market, Shop, and Inventory.
* **Vanilla JavaScript:** Handles DOM manipulation, API fetching, and game logic.

**Backend:**
* **Node.js:** The runtime environment.
* **Express.js:** Web server framework.
* **Swagger:** Automated API documentation.

**Assets:**
* Custom sound effects (e.g., *fineAdditionToMyCollection.wav*).
* High-quality Marvel assets and UI icons.

---

## API Documentation

This project includes fully integrated Swagger documentation.
Once the server is running, you can access the interactive API docs at:


