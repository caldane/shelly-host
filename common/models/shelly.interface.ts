export interface ShellyStatus {
    id: number
    src: string
    result: ShellyStatusResult
  }
  
  export interface ShellyStatusResult {
    ble: Ble
    bthome: Bthome
    cloud: Cloud
    "input:0": ShellyInput
    knx: Knx
    mqtt: Mqtt
    "switch:0": ShellySwitch
    sys: Sys
    wifi: Wifi
    ws: Ws
  }
  
  export interface Ble {}
  
  export interface Bthome {
    errors: string[]
  }
  
  export interface Cloud {
    connected: boolean
  }
  
  export interface ShellyInput {
    id: number
    state: boolean
  }
  
  export interface Knx {}
  
  export interface Mqtt {
    connected: boolean
  }
  
  export interface ShellySwitch {
    id: number
    source: string
    output: boolean
    temperature: Temperature
  }
  
  export interface Temperature {
    tC: number
    tF: number
  }
  
  export interface Sys {
    mac: string
    restart_required: boolean
    time: string
    unixtime: number
    uptime: number
    ram_size: number
    ram_free: number
    fs_size: number
    fs_free: number
    cfg_rev: number
    kvs_rev: number
    schedule_rev: number
    webhook_rev: number
    available_updates: AvailableUpdates
    reset_reason: number
  }
  
  export interface AvailableUpdates {
    stable: Stable
  }
  
  export interface Stable {
    version: string
  }
  
  export interface Wifi {
    sta_ip: string
    status: string
    ssid: string
    rssi: number
  }
  
  export interface Ws {
    connected: boolean
  }
  