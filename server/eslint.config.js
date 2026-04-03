module.exports = [
	{
		files: ['**/*.js'],
		ignores: ['node_modules/**'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'commonjs',
			globals: {
				process: 'readonly',
				module: 'readonly',
				require: 'readonly',
				__dirname: 'readonly',
				console: 'readonly'
			}
		},
		rules: {
			'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
			'no-undef': 'error'
		}
	}
];
