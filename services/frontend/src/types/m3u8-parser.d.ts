declare module 'm3u8-parser' {
  export interface Segment {
    title?: string
    uri?: string
    duration?: number
    byterange?: {
      length: number
      offset: number
    }
    programDateTime?: number
    attributes?: Record<string, any>
    discontinuity?: number
    timeline?: number
    key?: {
      method: string
      uri: string
      iv: string
    }
    map?: {
      uri: string
      byterange: {
        length: number
        offset: number
      }
    }
    custom?: Record<string, any>
  }

  export interface Manifest {
    allowCache: boolean
    endList: boolean
    mediaSequence: number
    discontinuitySequence: number
    playlistType: string
    segments: Segment[]
    targetDuration: number
    totalDuration: number
    discontinuityStarts: number[]
    dateTimeString?: string
    dateTimeObject?: Date
    custom?: Record<string, any>
  }

  export class Parser {
    constructor()
    push(chunk: string): void
    end(): void
    manifest: Manifest
    addParser(options: {
      expression: RegExp
      customType: string
      dataParser?: (line: string) => any
      segment?: boolean
    }): void
    addTagMapper(options: {
      expression: RegExp
      map: (line: string) => string
    }): void
  }
} 