


class RecipeEditor extends React.Component {
    saveAndClose() {
        this.props.save($('#editor-name').val(), $('#editor-ingredients').val().split('\n').filter(ing => !!ing), this.props.config.key);
        this.props.close();
    }

    render() {
        return (
            <div>
                <ReactBootstrap.Modal show={this.props.config.showEditor} onHide={this.props.close}>
                    <ReactBootstrap.Modal.Header closeButton>
                        <ReactBootstrap.Modal.Title>{this.props.config.title}</ReactBootstrap.Modal.Title>
                    </ReactBootstrap.Modal.Header>
                    <ReactBootstrap.Modal.Body>
                        <h5>Recipe Name</h5>
                        <input id="editor-name" type="text" defaultValue={this.props.config.name} placeholder="Enter recipe name..."/>
                        <h5>Ingredients</h5>
                        <textarea id="editor-ingredients" defaultValue={this.props.config.ingred} placeholder="Enter ingredients separeted by a newline"></textarea>
                    </ReactBootstrap.Modal.Body>
                    <ReactBootstrap.Modal.Footer>
                        <ReactBootstrap.Button onClick={this.saveAndClose.bind(this)} bsStyle="primary">Save</ReactBootstrap.Button>
                        <ReactBootstrap.Button onClick={this.props.close} bsStyle="danger">Close</ReactBootstrap.Button>
                    </ReactBootstrap.Modal.Footer>
                </ReactBootstrap.Modal>
            </div>
        );
    }
}


class Ingredient extends React.Component {
    render() {
        return (
            <div className="well"> {this.props.name} </div>
        );
    }
}


class Recipe extends React.Component {
    constructor(...args) {
        super(...args);
        this.state = {
            open: false
        };
    }

    editRecipe() {
        this.props.edit(this.props.recipe.name, this.props.recipe.ingredients.join('\n'), this.props.recipe.key);
    }

    delete() {
        this.props.delete(this.props.recipe.key);
    }

    render() {
        let recipeitems = this.props.recipe.ingredients.map(ingredient => (<Ingredient name={ingredient}/>));

        return (
            <div>
                <ReactBootstrap.Button onClick={()=> this.setState({ open: !this.state.open })} bsStyle="primary">
                    {this.props.recipe.name}
                </ReactBootstrap.Button>
                <ReactBootstrap.Panel collapsible expanded={this.state.open}>
                    {recipeitems}
                    <ReactBootstrap.Button bsStyle="primary" bsSize="small" onClick={this.editRecipe.bind(this)}>
                        Edit
                    </ReactBootstrap.Button>
                    <ReactBootstrap.Button bsStyle="danger" bsSize="small" onClick={this.delete.bind(this)}>
                        Delete
                    </ReactBootstrap.Button>
                </ReactBootstrap.Panel>
            </div>
        );
    }
}


class RecipeList extends React.Component {
    render() {
        let recipes = this.props.recipes.map(recipe => (<Recipe recipe={recipe} edit={this.props.edit} delete={this.props.delete}/>));

        return (
            <div>
                {recipes}
            </div>
        );
    }
}


class RecipeAdder extends React.Component {
    render() {
        return (
            <ReactBootstrap.Button bsStyle="primary" bsSize="large" onClick={this.props.open}>
                Add new recipe
            </ReactBootstrap.Button>
        );
    }
}

class RecipeBox extends React.Component {
    constructor(...args) {
        super(...args);
        this.state = {
            showEditor: false,
            title: 'should be overriden',
            name: 'should be overriden',
            ingredients: 'should be overriden',
            key: -1
        };

        if(!localStorage.getItem(RecipeBox.Enum.DICTIONARY)) {
            let recipes = [{
                name: 'Pumpkin Pie',
                ingredients: ['Pumpkin Puree', 'Sweetened Condensed Milk', 'Eggs', 'Pumpkin Pie Spice', 'Pie Crust'],
                key: Math.random() * Math.random() * Math.random()
            }];

            localStorage.setItem(RecipeBox.Enum.DICTIONARY, JSON.stringify(recipes));
        }

        this.state.recipes = JSON.parse(localStorage.getItem(RecipeBox.Enum.DICTIONARY));
    }

    close() {
        this.setState({ showEditor: false });
    }

    open(title, name, ingred, key) {
        this.setState({ showEditor: true, title, name, ingred, key });
    }

    save(name, ingred, key) {
        let present = false;
        let recipes = this.state.recipes.map(recipe => {
            if (recipe.key == key) {
                recipe.ingredients = ingred;
                recipe.name = name;
                present = true;
            }
            return recipe;
        });

        if(!present) recipes.push({
                            name, 
                            ingredients: ingred, 
                            key: Math.random() * Math.random() * Math.random()
                        });

        this.setState({recipes});
        localStorage.setItem(RecipeBox.Enum.DICTIONARY, JSON.stringify(recipes));
    }

    delete(key) {
        let recipes = this.state.recipes.filter(recipe => recipe.key != key);
        this.setState({recipes});
        localStorage.setItem(RecipeBox.Enum.DICTIONARY, JSON.stringify(recipes));
    }

    render() {
        return (
            <div>
                <RecipeList edit={this.open.bind(this, 'Edit Recipe')} delete={this.delete.bind(this)} recipes={this.state.recipes}/>
                <RecipeAdder open={this.open.bind(this, 'Add Recipe', '', '', '')}/>
                <RecipeEditor config={this.state} close={this.close.bind(this)} save={this.save.bind(this)}/>
            </div>
        );
    }
}

RecipeBox.Enum = {
    DICTIONARY: 'recipes'
}

ReactDOM.render(<RecipeBox/>, $('background').get(0));
