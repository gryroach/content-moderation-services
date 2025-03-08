import {
  safeParseJSON,
  safeAccess,
  safeToString,
  safeToNumber,
  safeToBoolean,
  safeToDate,
  safeToArray,
} from "@/lib/error-handling"

// Example 1: Safely parsing JSON strings
function exampleJsonParsing() {
  // Valid JSON string
  const validJson = '{"name":"John","age":30}'
  const parsedValid = safeParseJSON(validJson, {})
  console.log("Parsed valid JSON:", parsedValid) // { name: 'John', age: 30 }

  // Invalid JSON string
  const invalidJson = '{"name":"John",age:30}' // Missing quotes around age
  const parsedInvalid = safeParseJSON(invalidJson, { name: "Unknown", age: 0 })
  console.log("Parsed invalid JSON:", parsedInvalid) // { name: 'Unknown', age: 0 }

  // Null or undefined
  const nullJson = null
  const parsedNull = safeParseJSON(nullJson, { name: "Default", age: 25 })
  console.log("Parsed null JSON:", parsedNull) // { name: 'Default', age: 25 }
}

// Example 2: Safely accessing nested properties
function examplePropertyAccess() {
  // Complete object
  const user = {
    profile: {
      name: "Alice",
      contact: {
        email: "alice@example.com",
        phone: "123-456-7890",
      },
    },
  }

  // Access existing property
  const email = safeAccess(user, "profile.contact.email", "no-email")
  console.log("Email:", email) // alice@example.com

  // Access non-existent property
  const address = safeAccess(user, "profile.contact.address", "No address provided")
  console.log("Address:", address) // No address provided

  // Access property on null
  const nullUser = null
  const nullName = safeAccess(nullUser, "profile.name", "Unknown")
  console.log("Name from null:", nullName) // Unknown

  // Access property with partially null path
  const partialUser = {
    profile: null,
  }
  const partialName = safeAccess(partialUser, "profile.name", "N/A")
  console.log("Partial name:", partialName) // N/A
}

// Example 3: Type conversion utilities
function exampleTypeConversion() {
  // String conversion
  console.log(safeToString(null)) // ''
  console.log(safeToString(undefined)) // ''
  console.log(safeToString(123)) // '123'
  console.log(safeToString({ foo: "bar" })) // '{"foo":"bar"}'

  // Number conversion
  console.log(safeToNumber(null)) // 0
  console.log(safeToNumber("123")) // 123
  console.log(safeToNumber("abc", 10)) // 10
  console.log(safeToNumber(true)) // 0

  // Boolean conversion
  console.log(safeToBoolean(null)) // false
  console.log(safeToBoolean("true")) // true
  console.log(safeToBoolean("false")) // false
  console.log(safeToBoolean(1)) // true

  // Date conversion
  console.log(safeToDate(null)) // current date
  console.log(safeToDate("2023-01-01")) // 2023-01-01T00:00:00.000Z
  console.log(safeToDate("invalid date")) // current date

  // Array conversion
  console.log(safeToArray(null)) // []
  console.log(safeToArray("[1,2,3]")) // [1,2,3]
  console.log(safeToArray("not an array")) // []
}

// Example 4: Handling API responses with missing fields
function exampleApiResponseHandling() {
  // Complete API response
  const completeResponse = {
    user: {
      id: 123,
      name: "Bob",
      email: "bob@example.com",
      preferences: {
        theme: "dark",
        notifications: true,
      },
    },
    posts: [
      { id: 1, title: "First Post" },
      { id: 2, title: "Second Post" },
    ],
  }

  // Incomplete API response
  const incompleteResponse = {
    user: {
      id: 456,
      name: "Charlie",
      // Missing email and preferences
    },
    // Missing posts
  }

  // Null API response
  const nullResponse = null

  // Process responses safely
  function processUserData(response: any) {
    const userId = safeAccess(response, "user.id", 0)
    const userName = safeAccess(response, "user.name", "Guest")
    const userEmail = safeAccess(response, "user.email", "no-email@example.com")
    const theme = safeAccess(response, "user.preferences.theme", "light")
    const notifications = safeAccess(response, "user.preferences.notifications", false)
    const posts = safeToArray(safeAccess(response, "posts", []))

    return {
      userId,
      userName,
      userEmail,
      theme,
      notifications,
      postCount: posts.length,
    }
  }

  console.log("Complete:", processUserData(completeResponse))
  // { userId: 123, userName: 'Bob', userEmail: 'bob@example.com', theme: 'dark', notifications: true, postCount: 2 }

  console.log("Incomplete:", processUserData(incompleteResponse))
  // { userId: 456, userName: 'Charlie', userEmail: 'no-email@example.com', theme: 'light', notifications: false, postCount: 0 }

  console.log("Null:", processUserData(nullResponse))
  // { userId: 0, userName: 'Guest', userEmail: 'no-email@example.com', theme: 'light', notifications: false, postCount: 0 }
}
