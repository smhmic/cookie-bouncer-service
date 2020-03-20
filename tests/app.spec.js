const request = require('supertest');
const app = require('../app');

describe('Test /', () => {

  test('It should respond 404 status to GET request for /', async done => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(404);
    done();
  });

  test('It should respond 200 status to POST request for / with a single cookie', async done => {
    const response = await request(app)
      .post('/')
      .set('origin', 'https://www.EXAMPLE-DOMAIN.com')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({name: '_ga', value: '12345'}));

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({msg: 'Processed cookies: _ga'});
    done();

  });

  test('It should respond 200 status to POST request for / with multiple cookies', async done => {
    const response = await request(app)
      .post('/')
      .set('origin', 'https://www.EXAMPLE-DOMAIN.com')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify([{name: '_ga', value: '12345'},{name: '_ga2', value: '123456'}]));

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({msg: 'Processed cookies: _ga,_ga2'});
    done();

  });

  test('It should respond 200 status to POST request for / with invalid body', async done => {
    const response = await request(app)
      .post('/')
      .set('origin', 'https://www.EXAMPLE-DOMAIN.com')
      .set('Content-Type', 'application/json')
      .send([1,2,3]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({msg: 'Processed cookies: '});
    done();

  });

  test('It should respond 200 status to POST request for / with invalid cookie object', async done => {
    const response = await request(app)
      .post('/')
      .set('origin', 'https://www.EXAMPLE-DOMAIN.com')
      .set('Content-Type', 'application/json')
      .send({name: 'hello', noValue: true});

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({msg: 'Processed cookies: '});
    done();

  });

  test('It should throw a CORS error with invalid origin', async done => {
    const response = await request(app)
      .post('/')
      .set( 'origin', 'https://www.EXAMPLE-DOMAIN-NOT-IN-WHITELIST.com' )
      .set('Content-Type', 'application/json')
      .send();

    expect(response.statusCode).toBe(500);
    done();
  });

  test('It should respond 200 status to POST request for / with valid subdomain', async done => {
    const response = await request(app)
      .post('/')
      .set('origin', 'https://subdomain.EXAMPLE-TOP-LEVEL-DOMAIN.com')
      .set('Content-Type', 'application/json')
      .send({name: 'hello', noValue: true});

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({msg: 'Processed cookies: '});
    done();

  });

  test('It should set basic cookies properly without applying defaults', async done => {
    const cookiesToSet = { name : '_ga', value : '12345' };
    const response = await request(app)
      .post('/')
      .set('origin', 'https://www.EXAMPLE-DOMAIN.com')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify( cookiesToSet ));

    expect( response.headers['set-cookie'] ).toEqual( ["_ga=12345; Path=/"] ); // TODO use flexible cookie parsing
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({msg: 'Processed cookies: _ga'});
    done();

  });
  
  
  test('It should set cookies with additional settings properly', async done => {
    const cookiesToSet = { 
      name : '_ga', 
      value : '12345', 
      options : { 
        domain: 'EXAMPLE-DOMAIN.com',
        path:'/testpath',
        //maxAge: 730*24*60*60*1000, TODO: test maxAge/expires
        //httpOnly : false, // Do not need to support this flag, as this library is for setting cookies for JS 
        sameSite:'None', 
        secure:true 
      } };
    const response = await request(app)
      .post('/')
      .set('origin', 'https://www.EXAMPLE-DOMAIN.com')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify( cookiesToSet ));

    //throw new Error( response.headers[ 'set-cookie' ] );
    expect( response.headers['set-cookie'] ).toEqual( ["_ga=12345; Domain=EXAMPLE-DOMAIN.com; Path=/testpath; Secure; SameSite=None"] ); // TODO use flexible cookie parsing
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({msg: 'Processed cookies: _ga'});
    done();

  });

});
