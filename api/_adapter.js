export function createHandler(coreLogic) {
  return async function handler(reqOrEvent, resOrContext) {
    // Check if invoked as Netlify Function (event object with httpMethod)
    if (reqOrEvent && reqOrEvent.httpMethod) {
      const event = reqOrEvent;
      let body = {};
      try {
        body = event.body ? (typeof event.body === 'string' ? JSON.parse(event.body) : event.body) : {};
      } catch (e) {
        body = {};
      }

      const req = {
        method: event.httpMethod,
        body: body,
        headers: event.headers || {},
      };

      const responseHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      };

      let statusCode = 200;
      let responseBody = '';

      const res = {
        setHeader(key, val) {
          responseHeaders[key] = val;
          return res;
        },
        status(code) {
          statusCode = code;
          return res;
        },
        json(data) {
          responseHeaders['Content-Type'] = 'application/json';
          responseBody = JSON.stringify(data);
          return { statusCode, headers: responseHeaders, body: responseBody };
        },
        end(data = '') {
          responseBody = typeof data === 'string' ? data : JSON.stringify(data);
          return { statusCode, headers: responseHeaders, body: responseBody };
        },
      };

      if (req.method === 'OPTIONS') {
        return { statusCode: 200, headers: responseHeaders, body: '' };
      }

      const result = await coreLogic(req, res);
      if (result && typeof result === 'object' && result.statusCode) {
        return result;
      }
      return { statusCode, headers: responseHeaders, body: responseBody };
    } else {
      // Express / Vite / Vercel (req, res)
      const req = reqOrEvent;
      const res = resOrContext;

      if (!res.setHeader) res.setHeader = () => res;
      if (!res.status) {
        res.status = (code) => {
          res.statusCode = code;
          return res;
        };
      }
      if (!res.json) {
        res.json = (data) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return res;
        };
      }

      return await coreLogic(req, res);
    }
  };
}
