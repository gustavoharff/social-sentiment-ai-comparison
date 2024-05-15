import { generateSasUrl, upload } from '@vizo/storage'

export class TaskFile {
  private taskId: string

  private lines: object[] = []

  constructor(taskId: string) {
    this.taskId = taskId
  }

  public addLine(object: object) {
    this.lines.push(object)
  }

  async create() {
    await upload({
      blob: Buffer.from(JSON.stringify([])),
      contentType: 'application/json',
      length: JSON.stringify([]).length,
      name: `task-${this.taskId}`,
    })
  }

  async generateSasUrl() {
    const url = await generateSasUrl({
      name: `task-${this.taskId}`,
      contentType: 'application/json',
    })

    return url
  }

  async save() {
    await upload({
      blob: Buffer.from(JSON.stringify(this.lines)),
      contentType: 'application/json',
      length: JSON.stringify(this.lines).length,
      name: `task-${this.taskId}`,
    })
  }
}
