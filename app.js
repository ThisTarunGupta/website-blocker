// Importing essential packages
const fs = require('fs');
const express = require('express');

const app = express();
app.use(express.urlencoded({extended: true}));

// Determining OS and req file
let file = '/etc/hosts';
if (process.platform === 'win32') 
	 file = 'C://Windows//System32//drivers//etc';
let websites = [];

// Routing
app.get('/', (req, res) => {
	fs.readFile('./templates/default-template.html', 'utf-8', (err, data) =>{
		if (err) return res.status(400).send('Error in opening <i>default-template.html</i>...');
		withData(data, res);
	});
});

app.get('/add', (req, res) => {
	fs.readFile('./templates/add-template.html', 'utf-8', (err, data) => {
		if (err) return res.status(404).send('Error in opening <emp>add-template<emp> file...');
		res.send(data);
	});
});

app.post('/add', (req, res) => {
	const index = req.body.website.indexOf('.');
	const length = req.body.website.length;
	if (index === -1 || index === 0 || index > (length - 3)) return res.status(400).send('<h1>Invalid website...</h1>');

	const result = '0.0.0.0  ' + req.body.website + '\n';
	fs.appendFileSync(file, result, 'utf-8', err => res.status(400).send('Error in updating...'));
	res.redirect('/');
});

app.post('/delete', (req, res) => {
	let sites = req.body.sites;
	let result = '';

	websites = websites.filter(x => !sites.includes(x));
	for(let id = 0; id < websites.length; id++)
		result += '0.0.0.0  ' + websites[id] + '\n';

	fs.writeFile(file, result, 'utf-8', err => console.log('Error : ', err));
	websites = [];
	sites = '';
	res.redirect('/');
});

function withData(oldHTML, res) {
	let result = '';
	let template = '<tr><td><website></td><td><input type="checkbox" name="sites" value="<id>" class="form-control"></td></tr>';
	websites = [];

	fs.readFile(file, 'utf-8', (err, data) => {
		if (err) throw err;

		const lines = data.split('\n').filter(line => line.includes('localhost') || line.includes('127.0.0.1') || line.includes('0.0.0.0'));
		for(let line = 0; line < lines.length; line++) {
			websites.push(lines[line].split(' ')[2]);

			let temp = template;
			temp = temp.replace('<website>', lines[line].split(' ')[2]);
			temp = temp.replace('<id>', lines[line].split(' ')[2]);
			result += temp;
		}
		result = oldHTML.replace('{%RESULT%}', result);
		return res.send(result);
	});
}

app.listen(3000, () => console.log('Listening on 3000 port...'));
