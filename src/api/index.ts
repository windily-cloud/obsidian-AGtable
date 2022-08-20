import { AxiosInstance } from 'axios';
import { AgtableSettings } from 'main';
import service from './service'

export default class Request {
  service: AxiosInstance
  constructor(public settings: AgtableSettings) {
    this.service = service(settings)
  }

  getTableList(projectId: string) {
    return this.service({
      url: `/api/v1/db/meta/projects/${projectId}/tables`,
      method: "get"
    })
  }

  getTableContent(projectName: string, tableName: string) {
    return this.service({
      url: `/api/v1/db/data/noco/${projectName}/${tableName}`,
      method: "get"
    })
  }
}