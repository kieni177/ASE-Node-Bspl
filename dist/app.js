"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pg_1 = require("pg");
const body_parser_1 = __importDefault(require("body-parser"));
const pool = new pg_1.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'admin',
    port: 5432,
});
const app = express_1.default();
const port = 3000;
app.use(body_parser_1.default.json());
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = yield pool.query('SELECT * from NOW()');
        res.status(200);
        res.send(now.rows[0].now);
    }
    catch (err) {
        console.log(err.stack);
    }
}));
app.get('/person', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const person = yield pool.query('SELECT * from PERSON');
        res.send(person.rows);
    }
    catch (err) {
        console.log(err.stack);
    }
}));
app.get('/person/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const person = yield pool.query('SELECT * from PERSON where id = ' + req.params.id);
        res.send(person.rows);
    }
    catch (err) {
        console.log(err.stack);
    }
}));
app.listen(port, err => {
    if (err) {
        return console.error(err);
    }
    return console.log(`server is listening on ${port}`);
});
//# sourceMappingURL=app.js.map