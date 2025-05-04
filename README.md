# uebForm

Biblioteca PHP para geração dinâmica de formulários baseados em dicionários de metadados de entidades. Permite criar, editar e validar formulários de maneira automatizada e consistente.

## Principal Funcionalidade

**A principal funcionalidade desta biblioteca é a view de formulário**, que permite gerar formulários completos através de uma URL simples:

```
/form/{entidade}/{id}/{campos_opcionais}
```

Por exemplo:
- `/form/clientes/2` - Editar o cliente com ID 2
- `/form/produtos/null` - Criar um novo produto
- `/form/usuarios/5/nome,email,telefone` - Editar o usuário 5, mostrando apenas os campos especificados

Esta abordagem torna extremamente fácil implementar CRUDs completos sem necessidade de codificação adicional para cada entidade.

## Funcionalidades

- **Geração Dinâmica**: Cria formulários automaticamente a partir de dicionários de metadados
- **Suporte a Diversos Tipos de Campos**: Input, textarea, select, checkbox, radio, switch, upload de arquivos, etc.
- **Relacionamentos**: Gerencia relacionamentos entre entidades (one-to-one, one-to-many, many-to-many)
- **Validação Cliente/Servidor**: Validação em JavaScript e PHP
- **Customização**: Personalize a aparência e comportamento dos formulários
- **Autocomplete**: Funcionalidade de preenchimento automático para campos relacionais
- **Responsivo**: Formulários adaptáveis a diferentes tamanhos de tela

## Instalação

```bash
composer require ueb/form
```

## Como Usar

### 1. Via URL (Método Principal)

Simplesmente acesse a URL no formato:

```
/form/{entidade}/{id}/{campos_opcionais}
```

O formulário será gerado automaticamente com base no dicionário de metadados da entidade.

### 2. Configuração de Rota (opcional)

Para implementar a rota `/form/`, você pode adicionar:

```php
// Em seu arquivo de rotas
Router::route('/form/:entity/:id', function($data) {
    $entity = $data['entity'];
    $id = $data['id'];
    include PATH_HOME . 'vendor/ueb/form/public/view/form/form.php';
});
```

### 3. Uso Programático (alternativo)

```php
// Criar um formulário para a entidade "produtos"
$form = new Form\Form("produtos");

// Exibir todos os campos da entidade
$form->showForm();

// Ou especificar campos desejados
$form->setFields(["nome", "descricao", "preco"]);
$form->showForm();

// Carregar formulário para edição
$form->showForm(5); // Carrega o registro com ID 5 para edição
```

## Personalização

```php
// Definir valores padrão para novos registros
$form = new Form\Form("usuarios");
$form->setDefaults([
    "status" => 1,
    "data_cadastro" => date("Y-m-d")
]);

// Personalizar botão de salvar
$form->setSaveButtonText("Cadastrar Usuário");
$form->setSaveButtonIcon("person_add");
$form->setSaveButtonClass("btn-large");

// Desativar salvamento automático
$form->setAutoSave(false);

// Definir callback após salvamento
$form->setCallback("reloadTable");
```

## Tipos de Campos Suportados

- **Input**: Texto, número, email, telefone, CPF, CNPJ, CEP, etc.
- **Textarea**: Campos de texto multilinha
- **Select**: Dropdown com opções
- **Checkbox/Radio**: Seleção única ou múltipla
- **Switch**: Toggle on/off
- **File**: Upload de arquivos
- **List**: Campos relacionais
- **List_mult**: Relações múltiplas
- **Extend**: Campos de extensão para relacionamentos complexos

## Opções da URL

A URL oferece algumas opções especiais:

- `form-no-header`: Esconde o cabeçalho do formulário
- `form-no-card`: Remove o estilo de card do formulário

Exemplo:
```
/form/clientes/2/form-no-header/form-no-card/nome/email
```

## API JavaScript

A biblioteca inclui scripts JavaScript para interação do usuário:

```javascript
// Inicializar formulário
$("#form-container").form("usuarios", null, ["nome", "email", "telefone"]);

// Inicializar com callback após salvamento
$("#form-container").form("usuarios", null, [], function() {
    alert("Usuário salvo com sucesso!");
});
```

## Endpoints

A biblioteca disponibiliza vários endpoints para processamento:

- `/post/save/form.php`: Salva dados do formulário
- `/post/api.php`: API principal para interação com formulários
- `/post/autocomplete/form.php`: Gerencia autocomplete de campos
- `/post/children/form.php`: Gerencia formulários filhos
- `/post/read/list.php`: Leitura de listas relacionais

## Requisitos

- PHP 7.2 ou superior
- MySQL/MariaDB
- Bibliotecas de dependência:
  - Entity (para gerenciamento de dicionários de metadados)
  - Helpers (para funções auxiliares)
  - Conn (para conexão com banco de dados)

## Exemplos Avançados

### Criando um formulário com relacionamentos

```php
// Formulário de pedidos com relacionamento a clientes
$form = new Form\Form("pedidos");
$form->showForm();

// Automaticamente gerencia o campo de seleção de cliente
// baseado no dicionário de metadados
```

### Validação customizada

```php
// A validação é definida no dicionário de metadados
// e processada automaticamente
```

## Contribuindo

Contribuições são bem-vindas! Por favor, sinta-se à vontade para enviar um Pull Request.

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).