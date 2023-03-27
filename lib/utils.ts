import { IExcaliServer } from './ts/app';

const servers: Record<number, IExcaliServer> = {};

export const getServer = (port: number): IExcaliServer => {
  return servers[port];
};

export const setServer = (port: number, server: IExcaliServer): void => {
  servers[port] = server;
};

export const deleteServer = (port: number): void => {
  delete servers[port];
};
