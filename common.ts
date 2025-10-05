import 'reflect-metadata';
import * as http from 'http';
export enum ParamType {
  QUERY = 'query',
  PARAM = 'param',
  BODY = 'body'
}

interface ModuleOptions {
  imports?: any[];
  controllers?: any[];
  providers?: any[];
  exports?: any[];
}


 class NestFactory {
  static async create(AppModule: any) {
    const controllers = Reflect.getMetadata('controllers', AppModule) || [];
    const providers = Reflect.getMetadata('providers', AppModule) || [];

    const providerInstances = new Map();
    for (const Provider of providers) {
      providerInstances.set(Provider, new Provider());
    }

    const routes: any[] = [];
    for (const Controller of controllers) {
      const prefix = Reflect.getMetadata('prefix', Controller) || '';
      const proto = Controller.prototype;

      const deps = Reflect.getMetadata('design:paramtypes', Controller) || [];
      const injections = deps.map((dep: any) => providerInstances.get(dep));
      const controllerInstance = new Controller(...injections);

      const methods = Object.getOwnPropertyNames(proto).filter(m => m !== 'constructor');
      for (const methodName of methods) {
        const method = Reflect.getMetadata('method', proto, methodName);
        const path = Reflect.getMetadata('path', proto, methodName);

        if (method && path) {
          routes.push({
            method,
            path: prefix + path,
            handler: (controllerInstance as any)[methodName].bind(controllerInstance),
          });
        }
      }
    }

    const server = http.createServer(async (req, res) => {
      const match = routes.find(r => r.method === req.method && r.path === req.url);

      if (match) {
        const result = await match.handler(req, res);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: result }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
    });

    return {
      listen: (port: number) => {
        server.listen(port, () => {
          console.log(`🚀 Server running on http://localhost:${port}`);
          routes.forEach(r => console.log(`[${r.method}] ${r.path}`));
        });
      },
    };
  }
}

export function Injectable() {
  return function (target: Function) {
    Reflect.defineMetadata('injectable', true, target);
  };
}

export function Inject(token?: any) {
  return function (target: Object, propertyKey: string | symbol, parameterIndex: number) {
    const existingParams: any[] = Reflect.getMetadata('design:paramtypes', target) || [];
    const injectTokens: any[] = Reflect.getMetadata('inject:tokens', target) || [];

    injectTokens[parameterIndex] = token || existingParams[parameterIndex];
    Reflect.defineMetadata('inject:tokens', injectTokens, target);
  };
}

export function Controller(prefix: string) {
  return function (target: Function) {
    Reflect.defineMetadata('prefix', prefix, target);
  };
}

function createMethodDecorator(method: string) {
  return function (path: string) {
    return function (target: any, propertyKey: string) {
      Reflect.defineMetadata('method', method, target, propertyKey);
      Reflect.defineMetadata('path', path, target, propertyKey);
    };
  };
}



function createParamDecorator(type: ParamType, key?: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const existingParams =
      Reflect.getMetadata('route:params', target, propertyKey) || [];

    existingParams.push({ index: parameterIndex, type, key });
    Reflect.defineMetadata('route:params', existingParams, target, propertyKey);
  };
}



export function Module(metadata: { controllers?: any[]; providers?: any[] }) {
  return function (target: any) {
    if (metadata.controllers) {
      Reflect.defineMetadata('controllers', metadata.controllers, target);
    }
    if (metadata.providers) {
      Reflect.defineMetadata('providers', metadata.providers, target);
    }
  };
}

export const Query = (key?: string) => createParamDecorator(ParamType.QUERY, key);
export const Param = (key?: string) => createParamDecorator(ParamType.PARAM, key);
export const Body = (key?: string) => createParamDecorator(ParamType.BODY, key);
export const Get = createMethodDecorator('GET');
export const Post = createMethodDecorator('POST');
export const Put = createMethodDecorator('PUT');
export const Delete = createMethodDecorator('DELETE');
export const Patch = createMethodDecorator('PATCH');
export { createMethodDecorator, createParamDecorator, NestFactory };


