# SauceDemo - Catalog, Navigation & User Variants Test Plan

## Application Overview

Test plan for the parts of SauceDemo (https://www.saucedemo.com) that sit outside the SCRUM-101 checkout flow: login validation and access control, product sorting, product details, the burger menu (All Items, Dynamic Catalog, About, Logout, Reset App State), the footer, the Dynamic Catalog pages (spinner, lazy load, slider), and the special test users that simulate defects (`problem_user`, `error_user`, `performance_glitch_user`, `visual_user`).

Produced by exploring the live site on 2026-10-14. Selectors use the site's `data-test` attributes. Unless a scenario says otherwise, every scenario starts from a fresh state: logged in as `standard_user` / `secret_sauce`, on the Products page (`/inventory.html`), cart empty. The catalog has 6 products: Backpack $29.99, Bike Light $9.99, Bolt T-Shirt $15.99, Fleece Jacket $49.99, Onesie $7.99, Test.allTheThings() T-Shirt (Red) $15.99.

**Observed defects during exploration** (scenarios below describe the *correct* behavior; a failing test here is a real app bug):
- Reset App State clears the cart badge but leaves "Remove" buttons on the Products page until the page is reloaded.
- Clicking "All Items" in the burger menu while already on the Products page leaves the menu open (from other pages it navigates and the menu closes).
- The lazy-load catalog lists "Test.allTheThings() T-Shirt (Red) (L)" twice in every batch.
- The special users show their intended defects (see section 7).

## Test Scenarios

### 1. Login Validation and Access Control

**Seed:** `tests/seed.spec.ts`

Start state for this group: logged out, on the login page (`/`).

#### 1.1. Username is required

**File:** `tests/saucedemo-catalog/login-validation.spec.ts`

**Steps:**
  1. Leave Username empty, type any password, click Login
    - expect: Error "Epic sadface: Username is required" is shown
    - expect: User stays on the login page

#### 1.2. Password is required

**File:** `tests/saucedemo-catalog/login-validation.spec.ts`

**Steps:**
  1. Type `standard_user`, leave Password empty, click Login
    - expect: Error "Epic sadface: Password is required" is shown

#### 1.3. Unknown user is rejected

**File:** `tests/saucedemo-catalog/login-validation.spec.ts`

**Steps:**
  1. Type an unknown username and password, click Login
    - expect: Error "Epic sadface: Username and password do not match any user in this service" is shown

#### 1.4. Protected pages redirect to login with a message

**File:** `tests/saucedemo-catalog/login-validation.spec.ts`

**Steps:**
  1. Open `/inventory.html` directly without logging in
    - expect: Login page is shown
    - expect: Error "Epic sadface: You can only access '/inventory.html' when you are logged in." is shown

#### 1.5. Accepted usernames are listed on the login page

**File:** `tests/saucedemo-catalog/login-validation.spec.ts`

**Steps:**
  1. Read the credentials box on the login page
    - expect: It lists standard_user, locked_out_user, problem_user, performance_glitch_user, error_user and visual_user

### 2. Product Sorting

**Seed:** `tests/seed.spec.ts`

#### 2.1. Default order is Name (A to Z)

**File:** `tests/saucedemo-catalog/product-sorting.spec.ts`

**Steps:**
  1. Open the Products page
    - expect: Sort dropdown shows "Name (A to Z)"
    - expect: Products are listed alphabetically A to Z

#### 2.2. Sort by Name (Z to A)

**File:** `tests/saucedemo-catalog/product-sorting.spec.ts`

**Steps:**
  1. Select "Name (Z to A)" in the sort dropdown
    - expect: Products are listed in reverse alphabetical order, starting with "Test.allTheThings() T-Shirt (Red)"
    - expect: The active sort label shows "Name (Z to A)"

#### 2.3. Sort by Price (low to high)

**File:** `tests/saucedemo-catalog/product-sorting.spec.ts`

**Steps:**
  1. Select "Price (low to high)"
    - expect: Prices are in ascending order, from $7.99 (Onesie) to $49.99 (Fleece Jacket)

#### 2.4. Sort by Price (high to low)

**File:** `tests/saucedemo-catalog/product-sorting.spec.ts`

**Steps:**
  1. Select "Price (high to low)"
    - expect: Prices are in descending order, from $49.99 to $7.99

#### 2.5. Cart state survives re-sorting

**File:** `tests/saucedemo-catalog/product-sorting.spec.ts`

**Steps:**
  1. Add Backpack and Onesie to the cart
  2. Change sort to "Price (high to low)", then "Name (Z to A)"
    - expect: Cart badge still shows 2
    - expect: Backpack and Onesie still show "Remove"

### 3. Product Details

**Seed:** `tests/seed.spec.ts`

#### 3.1. Open details from the product name

**File:** `tests/saucedemo-catalog/product-details.spec.ts`

**Steps:**
  1. Click the "Sauce Labs Backpack" name
    - expect: URL is `/inventory-item.html?id=4`
    - expect: Name, description, price ($29.99) and image are shown
    - expect: "Back to products" button is shown

#### 3.2. Open details from the product image

**File:** `tests/saucedemo-catalog/product-details.spec.ts`

**Steps:**
  1. Click the Bike Light image
    - expect: Details page for "Sauce Labs Bike Light" opens (`id=0`)

#### 3.3. Add and remove from the details page

**File:** `tests/saucedemo-catalog/product-details.spec.ts`

**Steps:**
  1. Open Backpack details and click "Add to cart"
    - expect: Cart badge shows 1, button changes to "Remove"
  2. Click "Remove"
    - expect: Cart badge disappears, button changes back to "Add to cart"

#### 3.4. Back to products keeps the cart

**File:** `tests/saucedemo-catalog/product-details.spec.ts`

**Steps:**
  1. Open Backpack details, add it to the cart, click "Back to products"
    - expect: Products page is shown
    - expect: Backpack shows "Remove" and the badge shows 1

#### 3.5. Invalid product id shows "not found"

**File:** `tests/saucedemo-catalog/product-details.spec.ts`

**Steps:**
  1. Open `/inventory-item.html?id=999`
    - expect: Product name shows "ITEM NOT FOUND"
  2. Open `/inventory-item.html?id=abc`
    - expect: Product name shows "ITEM NOT FOUND"

### 4. Burger Menu and Session

**Seed:** `tests/seed.spec.ts`

#### 4.1. Menu opens and closes

**File:** `tests/saucedemo-catalog/menu-and-session.spec.ts`

**Steps:**
  1. Click the menu button
    - expect: Menu shows All Items, Dynamic Catalog, About, Logout, Reset App State
  2. Click the close (X) button
    - expect: Menu is hidden

#### 4.2. About links to saucelabs.com

**File:** `tests/saucedemo-catalog/menu-and-session.spec.ts`

**Steps:**
  1. Open the menu
    - expect: "About" links to https://saucelabs.com/

#### 4.3. All Items returns to Products and closes the menu

**File:** `tests/saucedemo-catalog/menu-and-session.spec.ts`

**Steps:**
  1. Open a product's details, open the menu, click "All Items"
    - expect: Products page is shown
    - expect: Menu closes

#### 4.4. Logout ends the session

**File:** `tests/saucedemo-catalog/menu-and-session.spec.ts`

**Steps:**
  1. Open the menu and click "Logout"
    - expect: Login page is shown
  2. Press the browser Back button
    - expect: Products page is not shown; the "You can only access '/inventory.html' when you are logged in." error is shown

#### 4.5. Cart persists across logout and login

**File:** `tests/saucedemo-catalog/menu-and-session.spec.ts`

**Steps:**
  1. Add Bike Light to the cart, log out, log back in as standard_user
    - expect: Cart badge shows 1

#### 4.6. Reset App State empties the cart and resets buttons

**File:** `tests/saucedemo-catalog/menu-and-session.spec.ts`

**Steps:**
  1. Add Backpack and Onesie, open the menu, click "Reset App State"
    - expect: Cart badge disappears
    - expect: All product buttons show "Add to cart" (observed: "Remove" stays until reload)

### 5. Footer

**Seed:** `tests/seed.spec.ts`

#### 5.1. Social links and copyright

**File:** `tests/saucedemo-catalog/footer.spec.ts`

**Steps:**
  1. Scroll to the footer on the Products page
    - expect: X links to https://x.com/saucelabs
    - expect: Facebook links to https://www.facebook.com/saucelabs
    - expect: LinkedIn links to https://www.linkedin.com/company/sauce-labs/
    - expect: Copyright reads "© <year> Sauce Labs. All Rights Reserved."

### 6. Dynamic Catalog

**Seed:** `tests/seed.spec.ts`

#### 6.1. Menu link opens the Dynamic Catalog options

**File:** `tests/saucedemo-catalog/dynamic-catalog.spec.ts`

**Steps:**
  1. Open the menu and click "Dynamic Catalog"
    - expect: Links for Lazy Load, Spinner and Slider are shown

#### 6.2. Spinner shows, then products load

**File:** `tests/saucedemo-catalog/dynamic-catalog.spec.ts`

**Steps:**
  1. Open `/dynamic-catalog-spinner.html`
    - expect: Title is "Dynamic Catalog - Spinner"
    - expect: A loading spinner is shown first
    - expect: The spinner is replaced by a grid of 6 products, each with name, price and image

#### 6.3. Lazy load adds products on scroll

**File:** `tests/saucedemo-catalog/dynamic-catalog.spec.ts`

**Steps:**
  1. Open `/dynamic-catalog-lazy-load.html`
    - expect: Title is "Dynamic Catalog - Lazy Load"; the first products are shown
  2. Scroll to the bottom of the list
    - expect: More products load
  3. Inspect a batch of loaded products
    - expect: No product name appears twice within a batch (observed: "(L)" T-Shirt is duplicated)

#### 6.4. Slider dots switch the product

**File:** `tests/saucedemo-catalog/dynamic-catalog.spec.ts`

**Steps:**
  1. Open `/dynamic-catalog-slider.html`
    - expect: Title is "Dynamic Catalog - Slider"; 6 dots are shown
  2. Click the 4th dot
    - expect: Slide shows "Test.allTheThings() T-Shirt (Red)" and that dot is marked current

### 7. Special Test Users (simulated defects)

**Seed:** `tests/seed.spec.ts`

Start state: logged out; each scenario logs in as the named user. Each scenario states the correct behavior, so it fails while the user's simulated defect is present.

#### 7.1. locked_out_user cannot log in

**File:** `tests/saucedemo-catalog/user-variants.spec.ts`

**Steps:**
  1. Log in as locked_out_user
    - expect: Error "Epic sadface: Sorry, this user has been locked out." is shown

#### 7.2. performance_glitch_user can still shop

**File:** `tests/saucedemo-catalog/user-variants.spec.ts`

**Steps:**
  1. Log in as performance_glitch_user
    - expect: Products page loads (observed: about 5 seconds)
  2. Sort by "Price (high to low)", add Fleece Jacket to the cart
    - expect: Fleece Jacket is first and the badge shows 1

#### 7.3. problem_user sees correct product images

**File:** `tests/saucedemo-catalog/user-variants.spec.ts`

**Steps:**
  1. Log in as problem_user
    - expect: Each product shows its own image (observed: every image is the same 404 placeholder)

#### 7.4. problem_user can sort products

**File:** `tests/saucedemo-catalog/user-variants.spec.ts`

**Steps:**
  1. Log in as problem_user, select "Name (Z to A)"
    - expect: List starts with "Test.allTheThings() T-Shirt (Red)" (observed: order does not change)

#### 7.5. problem_user opens the right product

**File:** `tests/saucedemo-catalog/user-variants.spec.ts`

**Steps:**
  1. Log in as problem_user, click the "Sauce Labs Backpack" name
    - expect: Details page for Backpack opens (observed: Fleece Jacket opens)

#### 7.6. error_user can sort products

**File:** `tests/saucedemo-catalog/user-variants.spec.ts`

**Steps:**
  1. Log in as error_user, select "Name (Z to A)"
    - expect: No error dialog; list is re-sorted (observed: alert "Sorting is broken! This error has been reported to Backtrace.")

#### 7.7. error_user can add every product

**File:** `tests/saucedemo-catalog/user-variants.spec.ts`

**Steps:**
  1. Log in as error_user, click "Add to cart" on all 6 products
    - expect: Badge shows 6 (observed: 3)

#### 7.8. visual_user sees catalog prices

**File:** `tests/saucedemo-catalog/user-variants.spec.ts`

**Steps:**
  1. Log in as visual_user
    - expect: Prices match the catalog (Backpack $29.99 … Onesie $7.99) (observed: random prices that change on reload)
