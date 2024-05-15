import {
  BlobSASPermissions,
  BlobServiceClient,
  HttpRequestBody,
} from '@azure/storage-blob'
import { env } from '@vizo/env'
import dayjs from 'dayjs'

const client = BlobServiceClient.fromConnectionString(
  env.AZURE_STORAGE_CONNECTION_STRING,
)

interface UploadOptions {
  name: string
  blob: HttpRequestBody
  length: number
  contentType: string
}

export async function upload(options: UploadOptions) {
  const type = options.contentType.split('/')[1]
  const container = getContainer()

  const blockBlobClient = container.getBlockBlobClient(
    `${options.name}.${type}`,
  )

  await blockBlobClient.upload(options.blob, options.length, {
    blobHTTPHeaders: {
      blobContentType: options.contentType,
    },
  })
}

interface GenerateSasUrlOptions {
  name: string
  contentType: string
}

export async function generateSasUrl(options: GenerateSasUrlOptions) {
  const container = getContainer()

  const fileName = `${options.name}.${options.contentType.split('/')[1]}`

  const blockBlobClient = container.getBlockBlobClient(fileName)

  const sas = await blockBlobClient.generateSasUrl({
    permissions: BlobSASPermissions.from({ read: true }),
    expiresOn: dayjs().add(30, 'days').toDate(),
  })

  return sas
}

function getContainer() {
  const containerName = env.AZURE_STORAGE_CONTAINER_NAME

  const container = client.getContainerClient(containerName)

  return container
}
