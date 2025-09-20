import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../Components/Navbar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Customise = ({ userId }) => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [recipes, setRecipes] = useState([]);
    const [editingRecipeId, setEditingRecipeId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        ingredients: '',
        approxTime: '',
        instructions: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState({ type: '', text: '' });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [recipeToDelete, setRecipeToDelete] = useState(null);
    const API_URL = `${API_BASE_URL}/custom-recipes`;

    const fetchRecipes = async () => {
        if (!userId) {
            setFeedbackMessage({ type: 'warning', text: 'Cannot fetch recipes. User ID is missing.' });
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch recipes');
            }
            const data = await response.json();
            setRecipes(data);
        } catch (error) {
            console.error("Error fetching recipes:", error);
            setFeedbackMessage({ type: 'danger', text: 'Error fetching recipes. Please check the server.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchRecipes();
        } else {
            setRecipes([]);
        }
    }, [userId]);

    const handleToggleForm = () => {
        setIsFormVisible(!isFormVisible);
        if (isFormVisible) {
            setFormData({
                name: '',
                ingredients: '',
                approxTime: '',
                instructions: ''
            });
            setEditingRecipeId(null);
            setFeedbackMessage({ type: '', text: '' });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!userId) {
            setFeedbackMessage({ type: 'danger', text: 'Cannot save recipe. User ID is missing.' });
            return;
        }
        setIsLoading(true);
        setFeedbackMessage({ type: '', text: '' });

        const recipeData = {
            ...formData,
            approxTime: Number(formData.approxTime),
            userId
        };

        try {
            let response;
            if (editingRecipeId) {
                response = await fetch(`${API_URL}/${editingRecipeId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(recipeData),
                });
                if (!response.ok) throw new Error('Failed to update recipe');
                setFeedbackMessage({ type: 'success', text: 'Recipe updated successfully!' });
            } else {
                response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(recipeData),
                });
                if (!response.ok) throw new Error('Failed to save new recipe');
                setFeedbackMessage({ type: 'success', text: 'Recipe saved successfully!' });
            }

            setFormData({
                name: '',
                ingredients: '',
                approxTime: '',
                instructions: ''
            });
            setEditingRecipeId(null);
            setIsFormVisible(false);
            fetchRecipes();
        } catch (error) {
            console.error("Error saving recipe:", error);
            setFeedbackMessage({ type: 'danger', text: `An error occurred: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (recipe) => {
        setFormData({
            name: recipe.name,
            ingredients: recipe.ingredients,
            approxTime: recipe.approxTime,
            instructions: recipe.instructions
        });
        setEditingRecipeId(recipe._id);
        setIsFormVisible(true);
        setFeedbackMessage({ type: '', text: '' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const confirmDelete = (recipe) => {
        setRecipeToDelete(recipe);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        const recipeId = recipeToDelete._id;
        setShowDeleteModal(false);
        setIsLoading(true);
        setFeedbackMessage({ type: '', text: '' });

        try {
            const response = await fetch(`${API_URL}/${recipeId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete recipe');
            setFeedbackMessage({ type: 'success', text: 'Recipe deleted successfully!' });
            fetchRecipes();
        } catch (error) {
            console.error("Error deleting recipe:", error);
            setFeedbackMessage({ type: 'danger', text: `An error occurred: ${error.message}` });
        } finally {
            setIsLoading(false);
            setRecipeToDelete(null);
        }
    };

    return (
        <div className="bg-dark text-white font-sans" style={{ minHeight: '100vh' }}>
            <div style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1030 }}>
                <Navbar />
            </div>
            <div style={{ paddingTop: '80px' }}>
                <div className="container mt-5">
                    <h1 className="text-center mb-4">Customise Recipes</h1>
                    <div className="d-flex justify-content-center mb-4">
                        <button
                            onClick={handleToggleForm}
                            className="btn btn-lg text-white"
                            style={{ backgroundColor: '#e56617ff', borderColor: '#ff6969ff' }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Loading...' : (isFormVisible ? 'Close Form' : 'Customise Recipe')}
                        </button>
                    </div>
                    {feedbackMessage.text && (
                        <div className={`alert alert-${feedbackMessage.type}`} role="alert">
                            {feedbackMessage.text}
                        </div>
                    )}
                    {isFormVisible && (
                        <div className="card bg-secondary text-white p-4 mb-5" style={{ border: '3px solid #FF7043' }}>
                            <h2 className="card-title text-center mb-4" style={{ textDecoration: 'underline' }}>
                                {editingRecipeId ? 'Edit Recipe' : 'Create New Recipe'}
                            </h2>
                            <form onSubmit={handleSave}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="name" className="form-label text-white-50">Recipe Name</label>
                                            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="form-control" style={{ backgroundColor: '#2a2f32', color: 'white', borderColor: '#495057' }} />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="approxTime" className="form-label text-white-50">Approx. Time (min)</label>
                                            <input type="number" id="approxTime" name="approxTime" value={formData.approxTime} onChange={handleInputChange} className="form-control" style={{ backgroundColor: '#2a2f32', color: 'white', borderColor: '#495057' }} />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="ingredients" className="form-label text-white-50">Ingredients</label>
                                            <textarea id="ingredients" name="ingredients" value={formData.ingredients} onChange={handleInputChange} rows="4" required className="form-control" style={{ backgroundColor: '#2a2f32', color: 'white', borderColor: '#495057', resize: 'vertical' }}></textarea>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="instructions" className="form-label text-white-50">Instructions</label>
                                            <textarea id="instructions" name="instructions" value={formData.instructions} onChange={handleInputChange} rows="10" required className="form-control" style={{ backgroundColor: '#2a2f32', color: 'white', borderColor: '#495057', resize: 'vertical' }}></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 text-center">
                                    <button type="submit" className="btn btn-lg" style={{ backgroundColor: '#f88111ff', borderColor: '#ff0000ff', color: 'white' }} disabled={isLoading}>
                                        {isLoading ? 'Saving...' : (editingRecipeId ? 'Save Edits' : 'Save Recipe')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    <div className="mt-5">
                        <h2 className="text-center mb-4">My Saved Recipes</h2>
                        {recipes.length === 0 ? (
                            <p className="text-center text-white-50">You haven't saved any recipes yet.</p>
                        ) : (
                            <div className="row g-4">
                                {recipes.map((recipe) => (
                                    <div key={recipe._id} className="col-md-6 col-lg-4 d-flex">
                                        <div className="card bg-secondary text-white w-100 d-flex flex-column" style={{ border: '3px solid #ff8c00ff' }}>
                                            <div className="card-body">
                                                <h3 className="card-title" style={{ textDecoration: 'underline', color: '#ff8a41ff', fontWeight: 'bold' }}>
                                                    {recipe.name}
                                                </h3>
                                                <p className="card-text text-white-50">Approx. Time: {recipe.approxTime || 'N/A'} min</p>
                                                <p className="card-text mt-3">
                                                    <strong>Ingredients:</strong> <br /> {recipe.ingredients}
                                                </p>
                                                <p className="card-text mt-3">
                                                    <strong>Instructions:</strong> <br /> {recipe.instructions}
                                                </p>
                                            </div>
                                            <div className="card-footer bg-transparent border-0 text-end pt-0 d-flex justify-content-end gap-2">
                                                <button onClick={() => handleEdit(recipe)} className="btn btn-sm btn-info">Edit</button>
                                                <button onClick={() => confirmDelete(recipe)} className="btn btn-sm btn-danger">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {showDeleteModal && (
                        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content bg-dark text-white border-secondary">
                                    <div className="modal-header border-secondary">
                                        <h5 className="modal-title">Confirm Deletion</h5>
                                        <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)}></button>
                                    </div>
                                    <div className="modal-body">
                                        <p>Are you sure you want to delete the recipe "{recipeToDelete?.name}"?</p>
                                    </div>
                                    <div className="modal-footer border-secondary">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                        <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Customise;