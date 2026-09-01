import { useState } from "react";

import './ImageSelector.css'

function ImageSelector({ selectedImage, backgrounds, onChange }){
    const [isOpen, setIsOpen] = useState(false);

    function handleSelect(imageName){
        onChange({ target: { value: imageName }});
        setIsOpen(false);
    }

    return( 
        <div className="image-selector position-relative"> 
            {/* Dropdown trigger */} 
            <button type="button" className="image-selector-trigger btn p-0 border-0 w-100" 
                onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen}> 
                <div className="position-relative overflow-hidden"> 
                    <img src={backgrounds[selectedImage]} alt={selectedImage} className="image-selector-current img-fluid" /> 
                    <div className="image-selector-overlay d-flex align-items-center justify-content-between px-3"> 
                        <span className="text-uppercase fw-bold"> Change Background </span> 
                        <span className={`image-selector-arrow ${ isOpen ? 'open' : '' }`} > ▼ </span> 
                    </div> 
                </div> 
            </button> 

            {/* Dropdown */} 
            {isOpen && ( 
                <div className="image-selector-menu position-absolute start-0 w-100 mt-2 p-2"> 
                    <div className="row g-2"> 
                        {Object.entries(backgrounds).map( ([imageName, image]) => ( 
                            <div className="col-6 col-md-4" key={imageName}> 
                                <button type="button" className={`image-selector-option btn p-0 w-100 
                                    ${ selectedImage === imageName ? 'selected' : '' }`} 
                                    onClick={() => handleSelect(imageName) }> 
                                    <div className="position-relative overflow-hidden"> 
                                        <img src={image} alt={imageName} className="image-selector-image img-fluid" /> 
                                        {selectedImage === imageName && ( 
                                            <div className="image-selector-selected"> ✓ </div> 
                                        )} 
                                    </div> 
                                </button> 
                            </div> 
                            ) 
                        )} 
                    </div> 
                </div> 
            )} 
        </div> 
    );
}

export default ImageSelector;