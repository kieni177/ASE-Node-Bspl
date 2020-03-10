import express from 'express';
import { Pool } from 'pg';
import bodyParser from "body-parser";

class RequestTable {
    id: number;
    correct: boolean;
    equation: string;
    max_moves: number;
};

class SolutionTable {
    id: number;
    equation: string;
    moves: number;
    user_supplied: boolean;
    request_id: number; // (FK)
};

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'admin',
    port: 5432,
});
const app = express();
const port = 8080;
app.use(bodyParser.json())


class Verify_Request {
    equation: string;
    max_moves: number;
    solutions: [];
};

class Verify_Solutions {
    equation: string;
    moves: number;
}

app.post('/puzzles/insert', async (req, res) => {
    try {

        checkEquation("1-8-4=-1");
    
       // const queryText = "INSERT INTO Person(id, name) VALUES($1, $2);"; // returning id
        // pool.query(queryText, [1,'Franz']);

      // const now = await pool.query('SELECT * from NOW()');
        res.send("test");
    } catch (err) {
        console.log(err.stack)
    }

});


function checkEquation(eq: string): boolean {
    let splitEqual = eq.split('=');

    let leftArray = splitEqual[0].split('');
    let rightArray = splitEqual[1].split('');


    let helpLeft = 0;
    for(let i = 0; i < leftArray.length; i++) {
        if( isDigit(leftArray[i]))
            helpLeft += parseInt(leftArray[i]);
        if( leftArray[i] === '-')  {
            helpLeft -= parseInt(leftArray[i+1]);
            i++
        }
        else if( leftArray[i] === '+')  {
            helpLeft += parseInt(leftArray[i+1]);
            i++;
        }
    }

    let helpRight = 0;
    for(let j = 0; j < rightArray.length; j++) {
        if( isDigit(rightArray[j]))
            helpRight += parseInt(rightArray[j]);
        if( rightArray[j] === '-')  {
            helpRight -= parseInt(rightArray[j+1]);
            j++;
        }
        else if( rightArray[j] === '+')   {
            helpRight += parseInt(rightArray[j+1]);
            j++;
        }

    }

    const numberLeft = myModulo(helpLeft);
    const numberRight = myModulo(helpRight);
    console.log("NumberLeft: " + numberLeft + " Number Right " + numberRight);

    return numberLeft === numberRight;
}


function myModulo(n : number) : number {
    if (n < 0) {
        return ((n%10)+10)%10;
    }
    return n%10;
}

function isDigit(digit: string): boolean {
    if( digit !== '+' && digit !== '-' )
        return true;
    return false;
}



app.post('/puzzles/verify', async (req, res)  => {
    try {
        let verifyRequest = new Verify_Request();
        verifyRequest.equation = req.body.equation;
        verifyRequest.max_moves = req.body.max_moves;
        verifyRequest.solutions = req.body.solutions;

        let possibleSolutonsByPC: Map<String, Number> = new Map();

        let splitSymbols = verifyRequest.equation.split("");
        let currentSoltions: string[][] = [splitSymbols];


        for(let m = 0; m <= verifyRequest.max_moves; m++) {
            
            const lastSolutions = [...currentSoltions];
            currentSoltions = [];

            console.log(lastSolutions);

            for(let p = 0; p < lastSolutions.length; p++ ) {

                for(let i = 0; i < lastSolutions[p].length; i++) {
                    console.log(lastSolutions[p]);

                    let movingArray = movingDigit(lastSolutions[p][i]);

                    if(movingArray && movingArray.length > 0  ) {
                        for(let o = 0;  o < movingArray.length; o++) {
                            let c3 = [...lastSolutions[p][i]];
                            c3[i] = movingArray[o];
                            currentSoltions.push(c3);
                       }
                    }
                }
            }
        }
      



        //status 417
        //status 200


        const requestInsertQuery = "INSERT INTO Request(correct, equations, max_moves) VALUES($1, $2, $3) RETURNING id;";
        let insert = await pool.query(requestInsertQuery, [false, verifyRequest.equation, verifyRequest.max_moves]);
         // insert.rows[0].id;

        res.status(200);
        res.send("hias");
    
    } catch (err) {
        console.log(err.stack)
    }
});







function removeDigit(digit: string): string[] {
    if(digit === '6')
        return ['5'];

     if(digit === '7')
        return ['1'];

    if(digit === '8')
        return ['0','9', '6'];

    if(digit === '9')
        return ['3','5'];
}

function addingDigit(digit: string): string[] {
    if(digit === '0')
        return ['8'];

    if(digit === '1')
        return ['7'];

    if(digit === '3')
        return ['9'];

    if(digit === '5')
        return ['6','9'];

    if(digit === '6')
        return ['8'];

    if(digit === '9')
        return ['8'];
}

function movingDigit(digit: string): string[] {
    if(digit === '0')
        return ['6,9'];

     if(digit === '2')
        return ['3'];

    if(digit === '5')
        return ['3'];

    if(digit === '6')
        return ['9','0'];

    
    if(digit === '6')
        return ['6','0'];
}




class Response_GET {
    id: number;
    correct: boolean;
    equation: string;
    max_moves: number;
    user_provided: SolutionTable[];
    pc_provided: SolutionTable[];
}


app.get('/puzzles/:id', async  (req, res) => {
    try {
        let request = await pool.query('SELECT * from REQUEST where id = ' + req.params.id  );
        let solutionsUser = await pool.query('SELECT * from SOLUTION where user_supplied = true and request_id =' + req.params.id + ' ;');
        let solutionsPC = await pool.query('SELECT * from SOLUTION where user_supplied = false and request_id =' + req.params.id + ' ;');


        // set up Response
        let response = new Response_GET();

        response.id = request.rows[0].id;
        response.correct   = request.rows[0].correct;
        response.equation  = request.rows[0].equation;
        response.max_moves = request.rows[0].max_moves;

        response.user_provided = solutionsUser.rows;
        response.pc_provided   = solutionsPC.rows;

        res.status(200);
        
        res.send(response);
    } catch (err) {
        console.log(err.stack)
    }
});

app.listen(port, err => {
    if (err) {
        return console.error(err);
    }
    return console.log(`server is listening on ${port}`);
});
