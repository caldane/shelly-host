export interface Webhooks {
    id: string
    src: string
    result: HookResult
    ip?: string
  }
  
  export interface HookResult {
    hooks: Hook[]
    rev: number
  }
  
  export interface Hook {
    id: number
    cid: number
    enable: boolean
    event: string
    name: string
    ssl_ca: string
    urls: string[]
    condition: any
    repeat_period: number
  }
  