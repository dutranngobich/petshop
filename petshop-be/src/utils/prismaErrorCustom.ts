import { Prisma } from '@prisma/client'

// Custom function to catch Prisma service errors
export const handlePrismaError = (error: unknown) => {
  console.error('Error in service method:', error)

  // Check for errors from Prisma and generate appropriate error messages
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    let message: string
    let status: number

    switch (error.code) {
      case 'P1000': // Authentication error
        status = 401
        message = `Authentication failed against database server at ${error.meta?.host}. Please make sure your database credentials are correct.`
        break

      case 'P1001': // Unable to reach the database server
        status = 503
        message = `Can't reach database server at ${error.meta?.host}:${error.meta?.port}. Please make sure your database server is running.`
        break

      case 'P1002': // Timeout error
        status = 504
        message = `The database server at ${error.meta?.host}:${error.meta?.port} was reached but timed out. Please try again later.`
        break

      case 'P1003': // Database does not exist
        status = 404
        message = `Database ${error.meta?.database_name} does not exist at ${error.meta?.host}:${error.meta?.port}.`
        break

      case 'P1008': // Operation timed out
        status = 504
        message = `Operations timed out after ${error.meta?.time}. Please try again.`
        break

      case 'P1009': // Database already exists
        status = 409
        message = `Database ${error.meta?.database_name} already exists at ${error.meta?.host}:${error.meta?.port}.`
        break

      case 'P1010': // User access denied
        status = 403
        message = `User ${error.meta?.user} was denied access on the database ${error.meta?.database_name}.`
        break

      case 'P1011': // TLS connection error
        status = 500
        message = `Error opening a TLS connection: ${error.meta?.message}.`
        break

      case 'P1013': // Invalid database connection string
        status = 400
        message = `The provided database string is invalid. ${error.meta?.details}.`
        break

      default: // Handle other errors
        status = 500
        message = `An unexpected error occurred. Prisma error code: ${error.code}.`
        break
    }

    return { status, message }
  }

  // Check for PrismaClientValidationError
  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      status: 400,
      message: `Validation error: ${error.message}`
    }
  }

  // Handle unknown errors
  return {
    status: 500,
    message: 'An unexpected error occurred. Please try again later.'
  }
}
