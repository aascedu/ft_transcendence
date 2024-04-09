{
	"info": {
		"_postman_id": "849f7e98-7530-4fa6-94ef-9d44a916c009",
		"name": "Alfred",
		"description": "Alfred est le Majordome du reseau Transcendence. Il est charge de stoquer les informations des users et de prendre en note les relations d'amitie entre les users.\n\nIl est disponible par 2 endpoints. (Utilisateurs et amities)",
		"schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
		"_exporter_id": "33552662"
	},
	"item": [
		{
			"name": "get personal information",
			"event": [
				{
					"listen": "test",
					"script": {
						"exec": [
							"var template = `",
							"<style type=\"text/css\">",
							"    .tftable {font-size:14px;color:#333333;width:100%;border-width: 1px;border-color: #87ceeb;border-collapse: collapse;}",
							"    .tftable th {font-size:18px;background-color:#87ceeb;border-width: 1px;padding: 8px;border-style: solid;border-color: #87ceeb;text-align:left;}",
							"    .tftable tr {background-color:#ffffff;}",
							"    .tftable td {font-size:14px;border-width: 1px;padding: 8px;border-style: solid;border-color: #87ceeb;}",
							"    .tftable tr:hover {background-color:#e0ffff;}",
							"</style>",
							"",
							"<table class=\"tftable\" border=\"1\">",
							"    <tr>",
							"        <th>Bonjour</th>",
							"    </tr>",
							"    <tr>",
							"        <td>{{response.Bonjour}}</td>",
							"    </tr>",
							"</table>",
							"`;",
							"",
							"function constructVisualizerPayload() {",
							"    return { response: pm.response.json() }",
							"}",
							"",
							"pm.visualizer.set(template, constructVisualizerPayload());"
						],
						"type": "text/javascript",
						"packages": {}
					}
				}
			],
			"protocolProfileBehavior": {
				"disableBodyPruning": true
			},
			"request": {
				"method": "GET",
				"header": [],
				"body": {
					"mode": "raw",
					"raw": "",
					"options": {
						"raw": {
							"language": "json"
						}
					}
				},
				"url": {
					"raw": "https://localhost:8000/alfred/user/users/1",
					"protocol": "https",
					"host": [
						"localhost"
					],
					"port": "8000",
					"path": [
						"alfred",
						"user",
						"users",
						"1"
					]
				}
			},
			"response": []
		},
		{
			"name": "get id 1 information",
			"request": {
				"method": "GET",
				"header": [],
				"url": {
					"raw": "https://localhost:8000/alfred/user/users/2",
					"protocol": "https",
					"host": [
						"localhost"
					],
					"port": "8000",
					"path": [
						"alfred",
						"user",
						"users",
						"2"
					]
				}
			},
			"response": []
		},
		{
			"name": "patch my users information",
			"request": {
				"method": "PATCH",
				"header": [],
				"body": {
					"mode": "raw",
					"raw": "{\n    \"Nick\": \"bpoumeau\",\n    \"Email\": \"bpoumeau@42.fr\",\n    \"Lang\": 2,\n    \"Font\": 0,\n    \"Avatar\": \"avatar\"\n}",
					"options": {
						"raw": {
							"language": "json"
						}
					}
				},
				"url": {
					"raw": "https://localhost:8000/alfred/user/users/0",
					"protocol": "https",
					"host": [
						"localhost"
					],
					"port": "8000",
					"path": [
						"alfred",
						"user",
						"users",
						"0"
					]
				}
			},
			"response": []
		},
		{
			"name": "get personal friend list",
			"request": {
				"method": "GET",
				"header": [],
				"url": {
					"raw": "https://localhost:8000/alfred/user/friends/0",
					"protocol": "https",
					"host": [
						"localhost"
					],
					"port": "8000",
					"path": [
						"alfred",
						"user",
						"friends",
						"0"
					]
				}
			},
			"response": []
		},
		{
			"name": "get twang's friends list",
			"request": {
				"method": "GET",
				"header": [],
				"url": {
					"raw": "https://localhost:8000/alfred/user/friends/2",
					"protocol": "https",
					"host": [
						"localhost"
					],
					"port": "8000",
					"path": [
						"alfred",
						"user",
						"friends",
						"2"
					]
				}
			},
			"response": []
		},
		{
			"name": "ask id2 to be friend",
			"request": {
				"method": "POST",
				"header": [],
				"body": {
					"mode": "raw",
					"raw": "",
					"options": {
						"raw": {
							"language": "json"
						}
					}
				},
				"url": {
					"raw": "https://localhost:8000/alfred/user/friends/2",
					"protocol": "https",
					"host": [
						"localhost"
					],
					"port": "8000",
					"path": [
						"alfred",
						"user",
						"friends",
						"2"
					]
				}
			},
			"response": []
		},
		{
			"name": "ask id1 to be friend",
			"request": {
				"method": "POST",
				"header": [],
				"body": {
					"mode": "raw",
					"raw": "",
					"options": {
						"raw": {
							"language": "json"
						}
					}
				},
				"url": {
					"raw": "https://localhost:8000/alfred/user/friends/1",
					"protocol": "https",
					"host": [
						"localhost"
					],
					"port": "8000",
					"path": [
						"alfred",
						"user",
						"friends",
						"1"
					]
				}
			},
			"response": []
		}
	]
}